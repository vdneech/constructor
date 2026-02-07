import re
from typing import Optional
from typing import List


def validate_phone(phone: str) -> Optional[str]:
    """
    Валидирует номер телефона, возвращает очищенный номер или None.

    Поддерживает:
    +7 (XXX) XXX-XX-XX, +7 XXX XXX XX XX, 8 XXX XXX XX XX, 79123456789

    Returns:
        str: очищенный номер (+7XXXXXXXXXX) или None
    """
    # Удаляем все НЕ цифры
    digits = re.sub(r'[^\d]', '', phone)

    # Проверяем длину (10 цифр без кода или 11 с +7/8)
    if len(digits) == 11:
        if digits.startswith('8'):
            digits = '7' + digits[1:]  # 8 → 7
        if not digits.startswith('7'):
            return None
        if not re.match(r'^7\d{10}$', digits):
            return None
    elif len(digits) == 10:
        digits = '7' + digits  # Добавляем +7
    else:
        return None

    return digits



