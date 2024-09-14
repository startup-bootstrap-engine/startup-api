#!/bin/bash

# Wait for RabbitMQ to start
until rabbitmqctl status; do
  echo "Waiting for RabbitMQ to start..."
  sleep 2
done

# Create user and set permissions
rabbitmqctl add_user $RABBITMQ_DEFAULT_USER $RABBITMQ_DEFAULT_PASS
rabbitmqctl set_user_tags $RABBITMQ_DEFAULT_USER administrator
rabbitmqctl set_permissions -p / $RABBITMQ_DEFAULT_USER ".*" ".*" ".*"

echo "RabbitMQ user created and permissions set."

# Enable AMQP 1.0 plugin
rabbitmq-plugins enable rabbitmq_amqp1_0
