exports.config = {
  agent_enabled: true, // Make sure the agent is still enabled.
  transaction_tracer: {
    enabled: true,
    record_sql: "off",
    explain_threshold: 500,
    ignore_transactions: ["OtherTransaction/Message/RabbitMQ/Exchange/Named/rpg_microservices"],
  },
  messaging: {
    rabbitmq: false, // Disable RabbitMQ monitoring.
  },
  logging: {
    level: "warn",
  },
};
