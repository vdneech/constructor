import logging
import time

logger = logging.getLogger('gfs')

class APILoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        logger.info('')
        try:
            response = self.get_response(request)
            duration = time.time() - start
            logger.info(
                f'{request.method} {request.path} '
                f'{response.status_code} {duration:.2f}s '
                f'user={getattr(request.user, 'id', 'Anonymous')}'
            )
        except Exception as e:
            duration = time.time() - start
            logger.error(
                f'{request.method} {request.path} '
                f'{response.status_code} {duration:.2f}s '
            )
        return response