import gradio as gr
import cv2
import numpy as np
import albumentations as A
from ultralytics import YOLO

# --- Configuration ---
TOOTH_MODEL_PATH = "teeth_best.pt"
TREATMENT_MODEL_PATH = "treatment_best.pt"

# Color Palette
CLASS_COLORS = {
    'Bone Loss': (200, 200, 200),
    'Caries': (0, 0, 255),
    'Crown': (255, 255, 0),
    'Filling': (255, 0, 0),
    'Impacted Tooth': (255, 0, 255),
    'Implant': (0, 255, 0),
    'Mandibular Canal': (180, 105, 255),
    'Maxillary sinus': (255, 191, 0),
    'Missing teeth': (128, 128, 128),
    'Periapical lesion': (0, 140, 255),
    'Post  Abutment': (255, 215, 0),
    'Root Piece': (42, 42, 165),
    'Root canal treatment': (128, 0, 128),
    'Healthy': (200, 200, 200),
    'Tooth_Outline': (255, 255, 255)
}

    # Matching / visualization thresholds (tweakable)
TREATMENT_BBOX_IOU_THRESHOLD = 0.2
TREATMENT_MASK_IOU_THRESHOLD = 0.08
CENTER_MATCH_DISTANCE_FACTOR = 0.6  

    # Show raw JSON in UI for debugging
SHOW_RAW_JSON = True
# Standard Sequences (ISO 3950 / FDI Notation)
SEQ_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
SEQ_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
STANDARD_TEETH_SET = set(str(t) for t in (SEQ_UPPER + SEQ_LOWER))

class DentalAnalyzer:
    def __init__(self):
        print("Loading models...")
        self.models_loaded = False
        try:
            self.model_teeth = YOLO(TOOTH_MODEL_PATH)
            self.model_treat = YOLO(TREATMENT_MODEL_PATH)
            self.models_loaded = True
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Please upload 'teeth_best.pt' and 'treatment_best.pt' to the Space.")

        self.neighbor_map = self._build_neighbor_map()

    def _build_neighbor_map(self):
        neighbors = {}
        for seq in [SEQ_UPPER, SEQ_LOWER]:
            for i, t in enumerate(seq):
                t_str = str(t)
                n = {}
                if i > 0: n['left'] = str(seq[i - 1])
                if i < len(seq) - 1: n['right'] = str(seq[i + 1])
                neighbors[t_str] = n
        return neighbors

    def _normalize_label(self, label, for_name=False):
        """Normalize labels: collapse whitespace and apply common aliases.

        for_name: used for treatment/class names (keep words, normalized spacing).
        otherwise used for tooth numeric labels (keep as-is trimmed).
        """
        if label is None:
            return ""
        s = str(label).strip()
        # collapse multiple spaces
        s = " ".join(s.split())

        # common alias map for class names (keys lowercased)
        aliases = {
            'tooth outline': 'Tooth_Outline',
            'toothoutline': 'Tooth_Outline',
            'post abutment': 'Post  Abutment',
            'post-abutment': 'Post  Abutment',
            'mandibular canal': 'Mandibular Canal',
            'mandibular_canal': 'Mandibular Canal',
            'mandibular-canal': 'Mandibular Canal'
        }

        if for_name:
            s_lower = s.lower()
            s = aliases.get(s_lower, s)
            return s

        # for tooth numbers, just return collapsed string
        return s

    def _mask_iou(self, pts1, pts2, shape):
        """Rasterize two polygon masks and compute IoU."""
        if pts1 is None or pts2 is None:
            return 0.0
        h, w = shape[0], shape[1]
        m1 = np.zeros((h, w), dtype=np.uint8)
        m2 = np.zeros((h, w), dtype=np.uint8)

        def _flatten(pts):
            if not pts:
                return []
            # If pts is a list of contours (each contour a list of [x,y])
            if isinstance(pts[0][0], (list, tuple)):
                flat = []
                for contour in pts:
                    flat.extend(contour)
                return flat
            # Single contour
            return pts

        flat1 = _flatten(pts1)
        flat2 = _flatten(pts2)

        try:
            p1 = np.array(flat1, np.int32).reshape((-1, 1, 2))
            p2 = np.array(flat2, np.int32).reshape((-1, 1, 2))
        except Exception:
            return 0.0

        cv2.fillPoly(m1, [p1], 1)
        cv2.fillPoly(m2, [p2], 1)

        inter = np.logical_and(m1, m2).sum()
        union = np.logical_or(m1, m2).sum()
        if union == 0:
            return 0.0
        return float(inter) / float(union)

    def _create_mask_from_bbox(self, bbox, segments=60, mode='ellipse'):
        """Create a polygon approximation mask from a bbox.

        Returns a single-contour list of [x,y] points.
        mode: 'ellipse' (smooth) or 'rect' (rectangle corners)
        """
        if bbox is None:
            return None
        x1, y1, x2, y2 = map(int, bbox)
        if mode == 'rect':
            return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]

        # ellipse approximation
        cx = (x1 + x2) / 2.0
        cy = (y1 + y2) / 2.0
        ax = max(1, (x2 - x1) / 2.0)
        ay = max(1, (y2 - y1) / 2.0)
        pts = []
        for t in np.linspace(0, 2 * np.pi, segments, endpoint=False):
            px = int(round(cx + ax * np.cos(t)))
            py = int(round(cy + ay * np.sin(t)))
            pts.append([px, py])
        return pts

    def _ensure_masks_for_all(self, teeth, treatments, img_shape):
        """Ensure every tooth and treatment has a mask. Create synthetic masks where missing.

        Updates lists in-place and returns them.
        """
        h, w = img_shape[:2]

        for tooth in teeth:
            if tooth.get('mask') is None and tooth.get('bbox') is not None:
                tooth['mask'] = self._create_mask_from_bbox(tooth['bbox'], mode='ellipse')
            # if missing entirely, but has estimated_center, create small circle mask
            if tooth.get('mask') is None and tooth.get('bbox') is None and 'estimated_center' in tooth:
                ex, ey = tooth['estimated_center']
                r = int(tooth.get('avg_width', 40) * 0.25)
                # approximate circle as polygon
                pts = []
                for t in np.linspace(0, 2 * np.pi, 24, endpoint=False):
                    px = int(round(ex + r * np.cos(t)))
                    py = int(round(ey + r * np.sin(t)))
                    pts.append([px, py])
                tooth['mask'] = pts

        for tr in treatments:
            if tr.get('mask') is None and tr.get('bbox') is not None:
                # for elongated structures prefer rect; for small items ellipse
                bw = tr['bbox'][2] - tr['bbox'][0]
                bh = tr['bbox'][3] - tr['bbox'][1]
                mode = 'rect' if (max(bw, bh) / min(bw, bh + 1e-6)) > 3.0 else 'ellipse'
                tr['mask'] = self._create_mask_from_bbox(tr['bbox'], mode=mode)

        return teeth, treatments

    def preprocess(self, image):
        aug = A.Compose([A.CLAHE(clip_limit=2.0, tile_grid_size=(16, 16), p=1.0)])
        return aug(image=image)['image']

    def _get_tooth_meta(self, t_num):
        """Parses tooth number for metadata (Quadrant, Anterior/Posterior)."""
        if not t_num.isdigit(): return None
        quadrant = t_num[0]
        index = t_num[1]
        return {
            'quad': quadrant,
            'idx': index,
            'upper': quadrant in ['1', '2'],
            'ant': index in ['1', '2', '3'],  # Incisors + Canine
            'post': index in ['4', '5', '6', '7', '8']  # Premolars + Molars
        }

    def estimate_virtual_positions(self, teeth):
        """Calculates expected (x, y) for missing teeth based on neighbors."""
        real_map = {str(t['tooth_number']): t for t in teeth if t['bbox'] is not None}
        if not real_map: return teeth

        # Calculate average width of detected teeth
        widths = [(t['bbox'][2] - t['bbox'][0]) for t in real_map.values()]
        avg_width = sum(widths) / len(widths) if widths else 50

        for seq in [SEQ_UPPER, SEQ_LOWER]:
            present_indices = []
            present_x, present_y = [], []

            # Collect data points from detected teeth
            for idx, t_num in enumerate(seq):
                t_str = str(t_num)
                if t_str in real_map:
                    bbox = real_map[t_str]['bbox']
                    present_indices.append(idx)
                    present_x.append((bbox[0] + bbox[2]) / 2)
                    present_y.append((bbox[1] + bbox[3]) / 2)

            if len(present_indices) < 2: continue

            # Interpolate positions for missing teeth
            for t in teeth:
                t_num = int(t['tooth_number']) if t['tooth_number'].isdigit() else 0
                if t['bbox'] is None and t_num in seq:
                    target_idx = seq.index(t_num)
                    est_x = np.interp(target_idx, present_indices, present_x)
                    est_y = np.interp(target_idx, present_indices, present_y)
                    t['estimated_center'] = (est_x, est_y)
                    t['avg_width'] = avg_width

        return teeth

    def assign_orphaned_treatments(self, teeth, unmatched):
        matched_indices = []

        for i, treat in enumerate(unmatched):
            if treat['name'] in ['Implant', 'Filling', 'Crown','Root Piece']:
                t_box = treat['bbox']
                t_center_x = (t_box[0] + t_box[2]) / 2
                t_center_y = (t_box[1] + t_box[3]) / 2

                best_match = None
                min_dist = float('inf')

                for tooth in teeth:
                    if tooth['bbox'] is None and 'estimated_center' in tooth:
                        ex, ey = tooth['estimated_center']
                        width_thresh = tooth['avg_width'] * 0.5
                        dist_x = abs(t_center_x - ex)
                        dist_y = abs(t_center_y - ey)

                        if dist_x < width_thresh and dist_y < (width_thresh * 2):
                            if dist_x < min_dist:
                                min_dist = dist_x
                                best_match = tooth

                if best_match:
                    treat['inferred'] = True
                    best_match['treatments'].append(treat)
                    matched_indices.append(i)
                    best_match['treatments'] = [t for t in best_match['treatments'] if t['name'] != 'Missing teeth']

        for i in sorted(matched_indices, reverse=True):
            unmatched.pop(i)

        return teeth, unmatched



    def analyze_global_state(self, teeth):
        """Generates a high-level treatment plan based on overall dentition."""
        global_plan = []
        timeline = "Standard Protocol: Visit 1 (Procedure) -> 3 Months Healing -> Visit 2 (Loading)"

        relevant_teeth = [t for t in teeth if t['tooth_number'][0] != '8']

        # Count Stats
        missing_cnt = sum(1 for t in relevant_teeth if any(tr['name'] == 'Missing teeth' for tr in t['treatments']))
        root_piece_cnt = sum(1 for t in relevant_teeth if any(tr['name'] == 'Root Piece' for tr in t['treatments']))
        restorable_cnt = len(relevant_teeth) - missing_cnt - root_piece_cnt

        # --- Case 9: Terminal Dentition ---
        # "If only root remnants remain... or if only 2 or 3 teeth remain"
        if restorable_cnt <= 3:
            global_plan.append("**Full Arch Rehabilitation Required.**")
            global_plan.append("\n**Visit 1:** Full extraction, Immediate Implant Placement (All-on-X).")
            global_plan.append("   - Upper Implants: 16, 14, 12 -- 22, 24, 26")
            global_plan.append("   - Lower Implants: 46, 44, 42 -- 32, 34, 36")
            global_plan.append("\n**Visit 2:** Aesthetic Bridges (14 teeth per arch).")
            return global_plan, timeline

        # --- Case 8: Aesthetic Case ---
        # "If no issue in X-ray... complete with no decay"
        total_findings = sum(len(t['treatments']) for t in relevant_teeth)
        if total_findings == 0:
            global_plan.append("Teeth are healthy, Aesthetic Crowns/Veneers are suggested based on patient photos.")
            return global_plan, timeline

        # --- Case 7: Complex Loss (Anterior + Posterior) ---
        # "Loss of >2 anterior + loss of posterior (4,5,6)"
        ant_missing = sum(1 for t in relevant_teeth if self._get_tooth_meta(t['tooth_number'])['ant'] and any(
            x['name'] == 'Missing teeth' for x in t['treatments']))
        post_missing = sum(1 for t in relevant_teeth if self._get_tooth_meta(t['tooth_number'])['post'] and any(
            x['name'] == 'Missing teeth' for x in t['treatments']))

        if ant_missing > 2 and post_missing >= 3:
            global_plan.append("**Combined Loss**")
            global_plan.append("\n**Visit 1:** Place Anterior Implants + Posterior Implants.\n")
            global_plan.append("**Visit 2:** Install Bridges.")
            return global_plan, timeline

        return [], timeline

    def recommend_treatment(self, tooth_data, full_record):
        t_num = tooth_data['tooth_number']
        meta = self._get_tooth_meta(t_num)
        if not meta: return [], None
        findings = tooth_data.get('treatments', [])
        findings_names = [f['name'] for f in findings]
        suggestions = []
        tooth_index = t_num[1]
        is_anterior = tooth_index in ['1', '2', '3']
        is_posterior = tooth_index in ['4', '5', '6', '7']
        # Direct treatment recommendations
        if 'Caries' in findings_names:
            caries_severity = "Composite Restoration"  # Default

            # Get Caries Data
            c_data = next((f for f in findings if f['name'] == 'Caries'), None)

            if c_data:
                # --- A. Calculate Size Ratio (Caries Area / Tooth Area) ---
                t_area = 0
                c_area = 0

                # Calculate Tooth Area
                if tooth_data.get('mask'):
                    t_pts = np.array(tooth_data['mask'], np.int32)
                    t_area = cv2.contourArea(t_pts)
                elif tooth_data.get('bbox'):
                    b = tooth_data['bbox']
                    t_area = (b[2] - b[0]) * (b[3] - b[1])

                # Calculate Caries Area
                if c_data.get('mask'):
                    c_pts = np.array(c_data['mask'], np.int32)
                    c_area = cv2.contourArea(c_pts)
                elif c_data.get('bbox'):
                    b = c_data['bbox']
                    c_area = (b[2] - b[0]) * (b[3] - b[1])

                # Calculate Ratio
                damage_ratio = c_area / t_area if t_area > 0 else 0

                # --- B. Check "Root Level" Extension ---
                is_lower_jaw = t_num[0] in ['3', '4']
                t_bbox = tooth_data['bbox']
                c_bbox = c_data['bbox']

                is_root_level = False
                if t_bbox and c_bbox:
                    tooth_height = t_bbox[3] - t_bbox[1]
                    c_center_y = (c_bbox[1] + c_bbox[3]) / 2

                    if is_lower_jaw:
                        # If caries is in the bottom 25% of the tooth -> Root level
                        if c_center_y > (t_bbox[3] - (tooth_height * 0.25)):
                            is_root_level = True
                    else:
                        # If caries is in the top 25% of the tooth -> Root level
                        if c_center_y < (t_bbox[1] + (tooth_height * 0.25)):
                            is_root_level = True

                # --- C. Final Decision ---
                # Threshold: If Caries is > 20% of tooth OR it touches the root
                has_infection = 'Periapical lesion' in findings_names
                if (is_root_level or damage_ratio > 0.2) and has_infection:
                    suggestions.append(f"Extraction (Hopeless: Deep Caries + Infection)")
                elif is_root_level or damage_ratio > 0.2:
                    suggestions.append(f"Extraction & Implant (Severe Decay {int(damage_ratio * 100)}%)")
                else:
                    suggestions.append(f"Composite Restoration (Decay: {int(damage_ratio * 100)}%)")

        if 'Bone Loss' in findings_names:
            suggestions.append("Periodontal Therapy / Evaluation")
        if 'Periapical lesion' in findings_names:
            suggestions.append("Root Canal Treatment")
        if 'Impacted Tooth' in findings_names:
            suggestions.append("Surgical Extraction")
        if 'Root Piece' in findings_names:
            suggestions.append("Extraction")

        # Missing teeth logic
        if 'Missing teeth' in findings_names and 'Implant' not in findings_names:
            if t_num in ['36','37','46','47']:
                suggestions.append("Implant (⚠️ Check Sinus Distance)")
            # Rule A: Posterior Teeth (Premolars/Molars) -> ALWAYS Implant
            elif is_posterior:
                suggestions.append("Implant (Posterior: High Occlusal Force)")

            # Rule B: Anterior Teeth (Incisors/Canines)
            elif is_anterior:
                gap_size = self._calculate_gap_size(t_num, full_record)

                # Sub-rule: Small gap (1-2 teeth) -> Bridge allowed
                if gap_size <= 2:
                    suggestions.append("Zirconia Bridge (Esthetic Zone)")
                # Sub-rule: Large gap (3+ teeth) -> Implant
                else:
                    suggestions.append("Implant (Large Anterior Span)")

        return suggestions

    def _calculate_gap_size(self, current_tooth_num, full_record):
        """Calculates how many consecutive teeth are missing around the current one."""

        missing_count = 1  # Start with self

        # Check Left Neighbor
        left_neighbor_num = self.neighbor_map.get(str(current_tooth_num), {}).get('left')
        if left_neighbor_num:
            status = self._get_tooth_status(left_neighbor_num, full_record)
            if status == 'Missing': missing_count += 1

        # Check Right Neighbor
        right_neighbor_num = self.neighbor_map.get(str(current_tooth_num), {}).get('right')
        if right_neighbor_num:
            status = self._get_tooth_status(right_neighbor_num, full_record)
            if status == 'Missing': missing_count += 1

        return missing_count

    def _get_tooth_status(self, t_num, full_record):
        if not t_num: return "Unknown"
        for t in full_record:
            if str(t['tooth_number']) == t_num:
                treats = [x['name'] for x in t.get('treatments', [])]
                if 'Implant' in treats: return 'Implant'
                if 'Crown' in treats: return 'Crown'
                if 'RCT' in treats or 'Root Canal Treatment' in treats: return 'RCT'
                if 'Filling' in treats: return 'Filling'
                if 'Missing teeth' in treats: return 'Missing'
        return "Healthy"

    def analyze(self, image):
        if not self.models_loaded:
            return image, {"error": "Models not loaded"}, "Error: Models missing."

        img_processed = self.preprocess(image)
        # 1. Run inference
        res_teeth = self.model_teeth(image, imgsz=1280, conf=0.4, iou=0.01, retina_masks=True)[0]
        res_treat = self.model_treat(image, imgsz=1280, conf=0.25, iou=0.2,retina_masks=True)[0]

        # 2. Parse Teeth (Updated for Segmentation)
        teeth = []
        seen_teeth = set()

        # Check if model returned masks
        if res_teeth.masks is not None:
            # Sort by confidence to pick best detections
            sorted_indices = sorted(range(len(res_teeth.boxes)), key=lambda i: res_teeth.boxes[i].conf[0], reverse=True)

            for i in sorted_indices:
                box = res_teeth.boxes[i]
                label = res_teeth.names[int(box.cls[0])]
                if label in seen_teeth: continue
                seen_teeth.add(label)

                # Extract Mask Points
                mask_points = res_teeth.masks.xy[i].tolist()  # List of [x, y] points

                teeth.append({
                    "tooth_number": label,
                    "bbox": box.xyxy[0].tolist(),  # Keep bbox for logic
                    "mask": mask_points,  # Add mask for drawing
                    "conf": float(box.conf[0]),
                    "treatments": []
                })
        else:
            # Fallback to BBox if model is not segmentation type
            print("Warning: Teeth model did not return masks. Falling back to BBox.")
            for box in sorted(res_teeth.boxes, key=lambda x: x.conf[0], reverse=True):
                label = res_teeth.names[int(box.cls[0])]
                if label in seen_teeth: continue
                seen_teeth.add(label)
                teeth.append({
                    "tooth_number": label,
                    "bbox": box.xyxy[0].tolist(),
                    "mask": None,
                    "conf": float(box.conf[0]),
                    "treatments": []
                })

        # 3. Parse Treatments
        treatments = []
        if res_treat.boxes:
            for i, box in enumerate(res_treat.boxes):
                label = res_treat.names[int(box.cls[0])]
                # normalize treatment/class name
                label = self._normalize_label(label, for_name=True)
                mask = res_treat.masks.xy[i].tolist() if res_treat.masks is not None else None
                treatments.append({
                    "name": label, "bbox": box.xyxy[0].tolist(), "mask": mask, "conf": float(box.conf[0])
                })

        # 4. Logic Pipeline
        # Ensure segmentation masks exist for everything (synthesize from bboxes if needed)
        teeth = [{**t} for t in teeth]
        treatments = [{**tr} for tr in treatments]
        teeth, treatments = self._ensure_masks_for_all(teeth, treatments, img_processed.shape)

        # teeth = self.fix_mirroring(teeth)

        # Standard Matching (IoU / mask overlap / center-in-tooth)
        unmatched = []
        img_shape = img_processed.shape[:2]
        for treat in treatments:
            matched = False
            t_box = treat.get('bbox')
            t_mask = treat.get('mask')
            # treat center
            if t_box:
                t_cx = (t_box[0] + t_box[2]) / 2
                t_cy = (t_box[1] + t_box[3]) / 2

            for tooth in teeth:
                th_box = tooth.get('bbox')
                th_mask = tooth.get('mask')

                # 1) If both have masks, prefer mask IoU
                mask_iou = 0.0
                if t_mask and th_mask:
                    mask_iou = self._mask_iou(t_mask, th_mask, img_shape)
                    if mask_iou >= TREATMENT_MASK_IOU_THRESHOLD:
                        tooth['treatments'].append(treat)
                        matched = True
                        break

                # 2) BBox IoU fallback (if boxes exist)
                if th_box and t_box:
                    xA = max(t_box[0], th_box[0])
                    yA = max(t_box[1], th_box[1])
                    xB = min(t_box[2], th_box[2])
                    yB = min(t_box[3], th_box[3])
                    inter = max(0, xB - xA) * max(0, yB - yA)
                    areaA = (t_box[2] - t_box[0]) * (t_box[3] - t_box[1])
                    areaB = (th_box[2] - th_box[0]) * (th_box[3] - th_box[1])
                    iou = inter / (areaA + areaB - inter) if (areaA + areaB - inter) > 0 else 0
                    if iou >= TREATMENT_BBOX_IOU_THRESHOLD:
                        tooth['treatments'].append(treat)
                        matched = True
                        break

                # 3) Center-in-tooth (use mask if available, else bbox proximity)
                try:
                    if th_mask and t_box:
                        # point polygon test
                        pt = (int(t_cx), int(t_cy))
                        poly = np.array(th_mask, np.int32).reshape((-1, 1, 2))
                        if cv2.pointPolygonTest(poly, pt, False) >= 0:
                            tooth['treatments'].append(treat)
                            matched = True
                            break
                    elif th_box and t_box:
                        # proximity check based on avg width of tooth (if available)
                        if 'avg_width' in tooth and tooth['avg_width'] > 0:
                            dist_x = abs(t_cx - ((th_box[0] + th_box[2]) / 2))
                            if dist_x < (tooth['avg_width'] * CENTER_MATCH_DISTANCE_FACTOR):
                                tooth['treatments'].append(treat)
                                matched = True
                                break
                except Exception:
                    pass

            if not matched:
                unmatched.append(treat)

        # Deduct Missing
        detected_numbers = set(t['tooth_number'] for t in teeth)
        for m_num in (STANDARD_TEETH_SET - detected_numbers - {'18','28','38','48'}):
            teeth.append({
                "tooth_number": m_num, "bbox": None, "mask": None, "conf": 1.0,
                "treatments": [{"name": "Missing teeth", "bbox": None, "mask": None}]
            })

        teeth = self.estimate_virtual_positions(teeth)
        teeth, unmatched = self.assign_orphaned_treatments(teeth, unmatched)

        # 5. Report Generation
        global_plans, global_timeline = self.analyze_global_state(teeth)
        report_md = "## 🦷 Automated Dental Report\n\n"
        if global_plans:
            report_md += "### 🏥 Global Treatment Plan\n"
            for line in global_plans:
                report_md += f"{line}\n"
            report_md += "\n---\n"

        report_md += "### 🦷 Individual Tooth Analysis\n"
        sorted_teeth = sorted(teeth, key=lambda x: (int(x['tooth_number']) if x['tooth_number'].isdigit() else 100))

        for tooth in sorted_teeth:
            plan = self.recommend_treatment(tooth, teeth)
            unique_findings = sorted(list(set([t['name'] for t in tooth['treatments']])))
            inferred_note = ""
            if any(t.get('inferred') for t in tooth['treatments']):
                inferred_note = " *(Inferred from position)*"

            if unique_findings or plan:
                t_names = ", ".join(unique_findings)
                report_md += f"**Tooth {tooth['tooth_number']}**\n"
                if t_names: report_md += f"- *Findings:* {t_names}{inferred_note}\n"
                for p in plan: report_md += f"- *Suggestion:* {p}\n"
                report_md += "\n"

        # 6. Visualization
        annotated_img = img_processed.copy()

        # Draw Teeth First (Base Layer)
        overlay_teeth = annotated_img.copy()
        # ---- Improved Tooth Visualization ----
        for tooth in teeth:
            bbox = tooth.get("bbox")
            number = str(tooth["tooth_number"])
            color = (220, 220, 220)

            # ---------- Draw detected teeth ----------
            if bbox:
                x1, y1, x2, y2 = map(int, bbox)
                cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, 1, lineType=cv2.LINE_AA)

                # Draw floating label (always inside box, cleaner)
                label_y = max(y1 + 15, 15)
                cv2.putText(
                    annotated_img, number,
                    (x1 + 4, label_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55, color, 2, cv2.LINE_AA
                )

            # ---------- Draw estimated missing teeth ----------
            elif "estimated_center" in tooth:
                ex, ey = map(int, tooth["estimated_center"])

                # subtle dot to mark estimated location
                cv2.circle(annotated_img, (ex, ey), 4, color, -1, cv2.LINE_AA)

                if any(tr.get("inferred") for tr in tooth.get("treatments", [])):
                    cv2.putText(
                        annotated_img, number,
                        (ex + 6, ey + 6),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, color, 1, cv2.LINE_AA
                    )

        # smooth overlay
        cv2.addWeighted(overlay_teeth, 0.22, annotated_img, 0.78, 0, annotated_img)

        # Draw Treatments (Top Layer)
        overlay_treat = annotated_img.copy()
        for t in teeth:
            for tr in t['treatments']:
                name = tr.get('name', '')
                color = CLASS_COLORS.get(name, (255, 0, 0))
                mask = tr.get('mask')
                bbox = tr.get('bbox')

                # Helper: convert mask into list of contours (np arrays)
                contours = []
                if mask:
                    try:
                        # mask may be single contour (list of [x,y]) or list of contours
                        if len(mask) > 0 and isinstance(mask[0][0], (list, tuple)):
                            for c in mask:
                                cnt = np.array(c, np.int32).reshape((-1, 1, 2))
                                contours.append(cnt)
                        else:
                            cnt = np.array(mask, np.int32).reshape((-1, 1, 2))
                            contours.append(cnt)
                    except Exception:
                        contours = []

                # Special rendering for Mandibular Canal: draw centerline (polylines), don't fill
                if name and name.lower().startswith('mandibular') and contours:
                    for cnt in contours:
                        # draw as open polyline (can be long thin structure)
                        pts_flat = cnt.reshape(-1, 2)
                        cv2.polylines(annotated_img, [cnt], False, color, 3, lineType=cv2.LINE_AA)
                    # small label near first contour
                    try:
                        first = contours[0].reshape(-1, 2)
                        cx = int(first[:, 0].mean())
                        cy = int(first[:, 1].mean())
                        cv2.putText(annotated_img, name, (cx + 6, cy + 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
                    except Exception:
                        pass

                else:
                    # Normal treatment rendering: outline + filled overlay
                    if contours:
                        try:
                            for cnt in contours:
                                cv2.polylines(annotated_img, [cnt], True, color, 2, lineType=cv2.LINE_AA)
                            cv2.fillPoly(overlay_treat, contours, color)
                        except Exception:
                            pass
                    elif bbox:
                        x1, y1, x2, y2 = map(int, bbox)
                        cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, 2)

        # Apply Treatment Overlay Transparency
        cv2.addWeighted(overlay_treat, 0.4, annotated_img, 0.6, 0, annotated_img)

        return annotated_img, teeth, report_md


analyzer = DentalAnalyzer()


def process_xray(image):
    if image is None: return None, None, None
    return analyzer.analyze(image)


with gr.Blocks(title="AI Dental Assistant") as demo:
    gr.Markdown("# 🦷 AI Dental Assistant & Treatment Planner (Segmentation Enabled)")
    with gr.Row():
        with gr.Column():
            input_img = gr.Image(label="Upload X-Ray", type="numpy")
            btn = gr.Button("Analyze", variant="primary")
        with gr.Column():
            output_img = gr.Image(label="AI Analysis")
            output_report = gr.Markdown(label="Clinical Report")
            output_json = gr.JSON(label="Raw Data", visible=SHOW_RAW_JSON)
    btn.click(fn=process_xray, inputs=input_img, outputs=[output_img, output_json, output_report])

if __name__ == "__main__":
    demo.launch()