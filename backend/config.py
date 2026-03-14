from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str

    # Future: uncomment when needed
    # openai_api_key: str = ""
    # openai_model: str = "gpt-4o-mini"
    # twilio_account_sid: str = ""
    # twilio_auth_token: str = ""
    # twilio_whatsapp_from: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}
