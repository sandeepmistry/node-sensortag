#!/bin/bash

# BLE connection params
min_conn_interval=6
max_conn_interval=6
slave_latency=0
supervision_timeout=100

# Set up BLE connection params
sudo bash -c 'echo '$min_conn_interval' > /sys/kernel/debug/bluetooth/hci0/conn_min_interval'
sudo bash -c 'echo '$max_conn_interval' > /sys/kernel/debug/bluetooth/hci0/conn_max_interval'
sudo bash -c 'echo '$slave_latency' > /sys/kernel/debug/bluetooth/hci0/conn_latency'
sudo bash -c 'echo '$supervision_timeout' > /sys/kernel/debug/bluetooth/hci0/supervision_timeout'

# Check params
cat /sys/kernel/debug/bluetooth/hci0/conn_min_interval
cat /sys/kernel/debug/bluetooth/hci0/conn_max_interval
cat /sys/kernel/debug/bluetooth/hci0/conn_latency
cat /sys/kernel/debug/bluetooth/hci0/supervision_timeout
