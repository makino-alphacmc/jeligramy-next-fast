from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(tittle="Instagram Clone API")

app.add_middleware(
    CORSMiddleware,
)