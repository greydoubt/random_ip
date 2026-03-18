# random_ip

<img width="818" height="290" alt="Screenshot 2026-03-17 at 22 03 37" src="https://github.com/user-attachments/assets/f772d46e-c9a8-4b92-9752-d48d2d1b5a10" />



# installation
npm install js-yaml

node validator.js topology.yaml



<img width="363" height="1058" alt="Screenshot 2026-03-17 at 21 31 07" src="https://github.com/user-attachments/assets/acb22dc8-cfee-4fa4-92cd-c3fabfeb6839" />



[firewall]
default_policy = "allow"

# Blocked IPv4 addresses
[firewall.blocklist.ipv4]
addresses = [
  "103.28.54.184",
  "108.34.182.56",
  "147.124.120.245",
  "149.154.167.50",
  "149.154.167.91",
  "149.154.175.50",
  "170.249.107.209",
  "173.231.80.185",
  "184.28.98.95",
  "192.168.1.162",
  "192.168.1.197",
  "224.76.78.75",
  "23.212.73.32",
  "230.0.0.1",
  "239.255.255.250",
  "8.8.8.8",
  "95.161.76.100"
]

# Blocked IPv6 addresses
[firewall.blocklist.ipv6]
addresses = [
  "2001:1998:f00:1::1",
  "2001:1998:f00:2::1",
  "2605:e000:1418:40ba:d6f9:5ebc:f09c:b7a3",
  "fe80::1eb0:44ff:fedf:fe0a"
]

# Memory Pressure
<img width="1754" height="298" alt="Screenshot 2026-03-17 at 21 34 37" src="https://github.com/user-attachments/assets/0acef081-ca52-46da-8cf3-fd0bd3b28f78" />


# Rules
[[firewall.rules]]
action = "block"
direction = "in"
ip_version = "ipv4"
source = "firewall.blocklist.ipv4.addresses"
description = "Block listed IPv4 addresses"

[[firewall.rules]]
action = "block"
direction = "in"
ip_version = "ipv6"
source = "firewall.blocklist.ipv6.addresses"
description = "Block listed IPv6 addresses"

# Debugging in The Terminal

[[set@nakamoto SHANNON % ping 192.168.1.162]]

PING 192.168.1.162 (192.168.1.162): 56 data bytes

Request timeout for icmp_seq 0

Request timeout for icmp_seq 1

Request timeout for icmp_seq 2

^X^C


[[--- 192.168.1.162 ping statistics ---]]

4 packets transmitted, 0 packets received, 100.0% packet loss
