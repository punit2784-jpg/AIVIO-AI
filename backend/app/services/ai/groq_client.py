import json
import logging

from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)

PLACEHOLDER_KEYS = {
    "",
    "replace_with_your_key",
    "your_key",
    "your_groq_key",
}


class AIConfigurationError(Exception):
    """Raised when Groq credentials are missing."""


class AIProviderError(Exception):
    """Raised when Groq returns an error or unusable content."""


class AIWorkflowError(Exception):
    """Raised when the workflow cannot run because the input is insufficient."""


def groq_configured() -> bool:
    key = (settings.GROQ_API_KEY or "").strip()
    return key not in PLACEHOLDER_KEYS


def _redact(message: str) -> str:
    key = (settings.GROQ_API_KEY or "").strip()
    if key and key in message:
        return message.replace(key, "[redacted]")
    return message[:800]


def complete_json(system_prompt: str, user_prompt: str) -> dict:
    if not groq_configured():
        raise AIConfigurationError(
            "GROQ_API_KEY is not configured. Open the project .env file and set "
            "GROQ_API_KEY to your Groq API key. Set GROQ_MODEL to a currently supported "
            "Groq model (the project default is openai/gpt-oss-120b). Restart the "
            "FastAPI server after saving .env. Keep the key on the backend only."
        )

    client = Groq(api_key=settings.GROQ_API_KEY.strip())
    model = settings.GROQ_MODEL or "openai/gpt-oss-120b"
    try:
        response = client.chat.completions.create(
            model=model,
            temperature=0.1,
            max_tokens=4096,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt[:20000]},
            ],
        )
    except Exception as exc:
        logger.warning("Groq request failed: %s", type(exc).__name__)
        raise AIProviderError(
            f"Groq request failed for model '{model}'. {_redact(str(exc))} "
            "Confirm that the API key is valid and that GROQ_MODEL is currently supported."
        ) from exc

    content = response.choices[0].message.content or "{}"
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AIProviderError("Groq returned content that was not valid JSON.") from exc
    if not isinstance(parsed, dict):
        raise AIProviderError("Groq JSON response must be an object.")
    return parsed
