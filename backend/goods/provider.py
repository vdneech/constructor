import json
from decimal import Decimal
from django.utils.html import strip_tags

def generate_provider_data(good):
    
    description = strip_tags(good.label)[:100]
    
    if isinstance(good.price, Decimal):
        price_str = f'{good.price:.2f}'
    else:
        price_str = str(good.price)

    return json.dumps({
        "receipt": {
            "items": [{
                "description": description,
                "quantity": 1.00,
                "amount": {"value": price_str, "currency": "RUB"},
                "vat_code": 1,
            }]
        },
        "amount": {"value": price_str, "currency": "RUB"},
    })