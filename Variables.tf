# variables.tf — объявляем переменные (без значений по умолчанию для секретов!)

variable "bot_token" {
  description = "Telegram Bot Token из BotFather"
  type        = string
  sensitive   = true  # Terraform не будет показывать в логах
}

variable "admin_chat_id" {
  description = "Твой Telegram user_id (получи у @userinfobot)"
  type        = string
  sensitive   = true
}
