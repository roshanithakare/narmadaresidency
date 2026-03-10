from .views import get_calendar_context

def calendar_context(request):
    """
    Context processor to add calendar data to all admin templates
    """
    if request.path.startswith('/admin/'):
        return get_calendar_context()
    return {}
