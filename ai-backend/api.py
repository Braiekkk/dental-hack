from fastapi import FastAPI, File, HTTPException, UploadFile
import cv2
import numpy as np

from app import analyzer


api = FastAPI(title="Dental Treatments API")


@api.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not analyzer.models_loaded:
        raise HTTPException(status_code=500, detail="Models not loaded")

    raw = await file.read()
    np_bytes = np.frombuffer(raw, np.uint8)
    image = cv2.imdecode(np_bytes, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    _, teeth, _ = analyzer.analyze(image)

    if isinstance(teeth, dict) and "error" in teeth:
        raise HTTPException(status_code=500, detail=teeth["error"])

    findings = []
    for tooth in teeth:
        tooth_number = str(tooth.get("tooth_number", ""))
        for treatment in tooth.get("treatments", []):
            cls = treatment.get("name")
            if not cls:
                continue
            findings.append({"tooth_number": tooth_number, "class": cls})

    return {
        "count": len(findings),
        "results": findings,
    }
