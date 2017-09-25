export default function () {
    var device = {
        type: 0, // 0: Gateway, 1: Smart meter, 2: Smart plug
        user_id: "",
        space_id:"",
        device_id: "", // Device ID
        device_name: "", //Device name
        parent_id: "", // Parent's device ID
        ip_addr: "",
        setup_date: ""
    };

    var data = {
        device_type: 0, // 0: Gateway, 1: Smart meter, 2: Smart plug
        device_id: "",
        raw_data: 0,
        unit: "",
        timestamp:0
    };

    var space = {
        name: "",
        space_id: "",
        user_id: "",
        localtion: ""
    };

    var user = {
        user_id: "",
        user_pw: "",
        devices: [],
        spaces: [],
    };


    return {
        device:device,
        user: user,
        data: data
    }
}
