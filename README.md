# Participation moneybox

## Setup

Add this to configuration.json to the "plugins" array:

```
{
  "name": "psp",
  "order": 2,
  "version": "master",
  "url": "https://github.com/our-city-app/plugin-psp.git"
}
```

This plugin requires the [Basic authentication plugin](https://github.com/our-city-app/plugin-basic-auth) to function, so add that as well.

## Initial server configuration

Run this script to set up the permission groups and roles:

```python
def setup_permission_groups():
    from plugins.psp.permissions import PARTICIPATION_CITIES_GROUP_ID
    from plugins.psp.models import City
    from plugins.psp.bizz.cities import _get_group_for_city
    from plugins.basic_auth.basic_auth_plugin import get_basic_auth_plugin
    new_groups = [_get_group_for_city(city) for city in City.query()]
    plugin = get_basic_auth_plugin()
    # Uncomment to re-run this script in case permissions are changed
    #plugin.unregister_groups([group.id for group in new_groups])
    plugin.register_groups(new_groups, PARTICIPATION_CITIES_GROUP_ID)
```
