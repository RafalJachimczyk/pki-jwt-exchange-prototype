var serviceRepository = function () {
    const serviceRegistry = [
        {
          'uuid': 'cddb01f1-46f1-4066-9414-b7467c9fe305',
          'cn':  'john@example.com' 
        },
        {
            'uuid': 'a8e43210-ac72-4d29-9195-8df970a5fe6a',
            'cn': 'PKI JWT Server'
        },
        {
            'uuid': 'a3434a7b-5d96-4db5-a281-e192bf55ee03',
            'cn': 'rafal@mediacapacitors.org'
        }
    ];

    var getServiceByCn = function (cn) {
        return serviceRegistry.find((item) => {
            return item.cn == cn;
        })
    }

    var getServiceByUuid = function (uuid) {
        return serviceRegistry.find((item) => {
            return item.uuid == uuid;
        })
    }


    return {
        getServiceByCn,
        getServiceByUuid
    }

}

module.exports = serviceRepository();






