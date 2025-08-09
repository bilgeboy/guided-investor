from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .settings import settings
from .routers import strategies
from .routers import run
from .sockets import stream

def create_app() -> FastAPI:
    app = FastAPI(title="AI Trader Backend", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOW_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(strategies.router, prefix="/api")
    app.include_router(run.router, prefix="/api")
    # WebSocket endpoint (registered as route function)
    app.add_api_websocket_route("/ws/stream", stream.stream_endpoint)

    @app.get("/health")
    def health():
        return {"ok": True}

    return app
