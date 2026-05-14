from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ai_service_hmac_secret: str = "dev_ai_hmac_change_me"
    hmac_max_skew_seconds: int = 300

    weaviate_url: str = "http://localhost:8080"
    weaviate_api_key: str | None = None

    # When False, services degrade gracefully (no Weaviate, deterministic sentiment).
    enable_weaviate: bool = False
    enable_real_models: bool = False


settings = Settings()
