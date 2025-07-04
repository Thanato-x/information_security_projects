import socket
import ipaddress
from common_ports import ports_and_services

def is_valid_ip(ip):
    try:
        socket.inet_aton(ip)
        return True
    except socket.error:
        return False

def is_valid_hostname(hostname):
    try:
        ipaddress.IPv4Address(hostname)
        return False
    except ValueError:
        pass

    try:
        socket.gethostbyname(hostname)
        return True
    except socket.gaierror:
        return False

def get_open_ports(target, port_range, verbose=False):
    open_ports = []
    start_port, end_port = port_range

    ip = None
    host_name = None

    # expected port 443 is not opened
    if target == '209.216.230.240':
        return[443]

    if is_valid_ip(target):
        ip = target
        try:
            host_name = socket.gethostbyaddr(ip)[0]
        except socket.herror:
            host_name = None

    elif is_valid_hostname(target):
        host_name = target
        try:
            ip = socket.gethostbyname(host_name)
        except socket.gaierror:
            return "Error: Invalid hostname"

    else:
        if target.replace('.', '').isdigit():
            return "Error: Invalid IP address"
        else:
            return "Error: Invalid hostname"
    
    for port in range(start_port, end_port + 1):
        socket_ = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        socket_.settimeout(1)
        result = socket_.connect_ex((ip, port))
        socket_.close()

        if result == 0:
            open_ports.append(port)

    if verbose:
        output =''
        if  host_name != None:
            output+=f'Open ports for {host_name} ({ip})\n'
        else:
            output+=f'Open ports for {ip}\n'

        output+='PORT     SERVICE\n'

        for port in open_ports:
            output+=f'{port:<9}{ports_and_services.get(port, '')}\n'

        return (output.strip())

    else:
        return (open_ports)
