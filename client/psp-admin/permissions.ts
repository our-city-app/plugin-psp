export const enum PSPPermission {
    LIST_CITY = 'psp.cities.list',
    GET_CITY = 'psp.cities.get',
    CREATE_CITY = 'psp.cities.create',
    UPDATE_CITY = 'psp.cities.update',
    LIST_QR_BATCHES = 'psp.qr.list',
    CREATE_QR_BATCH = 'psp.qr.create',
    GET_QR_BATCH = 'psp.qr.get',
    LIST_MERCHANTS = 'psp.merchants.list',
    GET_MERCHANT = 'psp.merchants.get',
    UPDATE_MERCHANT = 'psp.merchants.update',
    CREATE_MERCHANT = 'psp.merchants.create',
}

export const enum CityPermission {
  GET_CITY = 'psp.cities.%(city_id)s.get',
  UPDATE_CITY = 'psp.cities.%(city_id)s.update',
  LIST_MERCHANTS = 'psp.cities.%(city_id)s.merchants.list',
  GET_MERCHANT = 'psp.cities.%(city_id)s.merchants.get',
  UPDATE_MERCHANT = 'psp.cities.%(city_id)s.merchants.update',
  CREATE_MERCHANT = 'psp.cities.%(city_id)s.merchants.create',
  LIST_QR_BATCHES = 'psp.cities.%(city_id)s.qr.list',
  CREATE_QR_BATCH = 'psp.cities.%(city_id)s.qr.create',
  GET_QR_BATCH = 'psp.cities.%(city_id)s.qr.get',
}
