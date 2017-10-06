#!/bin/sh
host=elasticsearch
mhost=localhost
uri=/api/ems/data
index=ems
dt_type=device_type
d_type=device
user=jseokchoi
pw=8910
prog=$0
interval=3
dev=none
debug=true
info=true

function debug {
    if [ $debug == true ]
    then
        echo "[DEBUG] $1"
    fi
}

function info {
    if [ $info == true ]
    then
        echo "[INFO] $1"
    fi
}

function usage {
    echo "================================================================="
    echo "EMS management CLI"
    echo "================================================================="
    echo "Commands : "
    echo "init_data) For EMS, some data will be indexed into elasticsearch"
    echo "simulate) Simulating sensing electric data"
    echo "del_device) Delete device"
    echo ""
    echo "Flags : "
    echo "-h, --host) Hostname of elasticsearch (default: $host)"
    echo "-e, --ems) Hostname of EMS system (default: $mhost)"
    echo "-i, --index) Index name of elasticsearch for EMS (default: $index)"
    echo "-u, --user) Username for elasticsearch (default: $user)"
    echo "-p, --password) Password for elasticsearch (default: $pw)"
    echo "-t, --interval) Simulating interval second (default: ${interval}s)"
    echo "-d, --id) Document's ID"
    echo "--uri) URI for insert data (default: $uri)"
    echo "--dev) Development URI string (default: $dev)"
    echo ""
    echo "ex) $prog {command} {flags}"
}

function index_device_type {
    n=$1
    v=$2
    curl -u "$user:$pw" -XPUT "$host:9200/$index/$dt_type/$v" -H "Content-Type: application/json" -d"{\"name\":\"$n\",\"value\":$v}"
}

function generate_device_types {
    types=( "Gateway" "Smart meter" "Smart plug" )
    i=0

    for t in "${types[@]}"; do
        index_device_type "$t" "$i"
        i=$((i+1))
    done
}

function get_all_devices {
    res=`curl -u "$user:$pw" -XGET "$host:9200/$index/$d_type/_search?pretty=true&q=*:*" 2>/dev/null`
    res=`echo $res | jq -r ".hits"`
    devices_t0=()
    devices_t1=()
    devices_t2=()
    parents_t1=()
    parents_t2=()
    i=0
    did=`echo $res | jq -r ".hits[$i]._source.device_id"`
    pid=`echo $res | jq -r ".hits[$i]._source.parent_id"`
    type=`echo $res | jq -r ".hits[$i]._source.type"`

    while [ "$did" != "null" ]; do
        case "$type" in
            "0")
                devices_t0+=( "$did" )
                ;;
            "1")
                devices_t1+=( "$did" )
                parents_t1+=( "$pid" )
                ;;
            "2")
                devices_t2+=( "$did" )
                parents_t2+=( "$pid" )
                ;;
        esac
        i=$((i+1))
        did=`echo $res | jq -r ".hits[$i]._source.device_id"`
        pid=`echo $res | jq -r ".hits[$i]._source.parent_id"`
        type=`echo $res | jq -r ".hits[$i]._source.type"`
    done

    debug "devices : ${devices[*]}"
    debug "parents : ${parents[*]}"
}

function gen_device_data {
    seed=$$
    limit=100
    data_t0=()
    data_t1=()
    data_t2=()
    rdata=()

    for d in "${devices_t2[@]}"
    do

        random=$((`head -200 /dev/urandom | cksum | cut -f1 -d " "`%100))
        data_t2+=( "$random" )
    done

    i=0
    for d in "${devices_t1[@]}"
    do
        j=0
        dd=$((`head -200 /dev/urandom | cksum | cut -f1 -d " "`%10))
        dd=$((dd+1))
        for p in "${parents_t2[@]}"
        do
            debug "$d $p"
            if [ "$d" == "$p" ]
            then
                debug "It is a parent."
                dd=$((dd+${data_t2[$j]}))
            fi
            j=$((j+1))
        done
        data_t1+=( $dd )
        i=$((i+1))
    done

    for d in "${devices_t0[@]}"
    do
        j=0
        dd=$((`head -200 /dev/urandom | cksum | cut -f1 -d " "`%10))
        dd=$((dd+3))
        for p in "${parents_t1[@]}"
        do
            debug "$d $p"
            if [ "$d" == "$p" ]
            then
                debug "It is a parent."
                dd=$((dd+${data_t1[$j]}))
            fi
            j=$((j+1))
        done
        data_t0+=( $dd )
        i=$((i+1))
    done

    debug "data_t2 : ${data_t2[*]}"
    debug "data_t1 : ${data_t1[*]}"
    debug "data_t0 : ${data_t0[*]}"
}

function put_data {
    p_id=$1
    p_val=$2
    debug "put_data : $p_id $p_val"

    if [ $dev == none ]
    then
        curl -u "$user:$pw" -H "kbn-xsrf: reporting" --output /dev/null -XPOST "http://$mhost:5601/$uri" -H "Content-Type: application/json" -d"{\"device_id\":\"$p_id\",\"value\":$p_val}" 2> /dev/null
    else
        curl -u "$user:$pw" --insecure -H "kbn-xsrf: reporting" --output /dev/null -XPOST "https://$mhost:5601/$dev$uri" -H "Content-Type: application/json" -d"{\"device_id\":\"$p_id\",\"value\":$p_val}" 2> /dev/null
    fi

}

function put_device_data {
    i=0

    for d in "${devices_t2[@]}"
    do
        put_data "$d" "${data_t2[$i]}"
        i=$((i+1))
    done

    i=0
    for d in "${devices_t1[@]}"
    do
        put_data "$d" "${data_t1[$i]}"
        i=$((i+1))
    done

    i=0
    for d in "${devices_t0[@]}"
    do
        put_data "$d" "${data_t0[$i]}"
        i=$((i+1))
    done
}

function init_data {
    generate_device_types
}

function simulate {
    get_all_devices
    gen_device_data
    put_device_data
}

function del_device {
    if [ "$id" != "" ]; then
        debug "$id will be removed."
        curl -u "$user:$pw" -XDELETE "$host:9200/$index/$d_type/$id?pretty"
    fi
}


cmd=$1

case $cmd in
    init_data | simulate | del_device)
        ;;
    *)
        usage
        exit
        ;;
esac

shift

while [ "$1" != "" ]; do
    case $1 in
        -h | --host)
            host=$2
            ;;
        -i | --index)
            index=$2
            ;;
        -u | --user)
            user=$2
            ;;
        -p | --password)
            pw=$2
            ;;
        -t | --interval)
            interval=$2
            ;;
        -d | --id)
            id=$2
            ;;
        -e | --ems)
            mhost=$2
            ;;
        --uri)
            uri=$2
            ;;
        --dev)
            dev=$2
            ;;
        *)
            usage
            exit
            ;;
    esac
    shift
    shift
done

$cmd
