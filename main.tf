terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

# =====================================================================
# МЫСАЛ 1: Желіні оқшаулау 
# =====================================================================
resource "docker_network" "nexthost_vpc" {
  name = "nexthost_private_network"
}

# =====================================================================
# МЫСАЛ 2: Тұрақты деректерді сақтау (База)
# =====================================================================
resource "docker_volume" "db_storage" {
  name = "nexthost_db_data"
}

resource "docker_image" "mariadb_img" {
  name = "mariadb:10.6"
}

# База контейнері
resource "docker_container" "db_container" {
  name  = "nexthost_db"
  image = docker_image.mariadb_img.image_id
  
  env = [
    "MYSQL_ROOT_PASSWORD=rootpassword",
    "MYSQL_DATABASE=nexthost",
    "MYSQL_USER=nexthost_user",
    "MYSQL_PASSWORD=secretpassword"
  ]

  ports {
    internal = 3306
    external = 3306
  }

  networks_advanced {
    name = docker_network.nexthost_vpc.name
  }
  
  volumes {
    volume_name    = docker_volume.db_storage.name
    container_path = "/var/lib/mysql"
  }
  
  # Прокидываем ЦЕЛИКОМ ПАПКУ database, а не файл
  volumes {
    host_path      = "${abspath(path.module)}/database" 
    container_path = "/docker-entrypoint-initdb.d"
  }
}

# =====================================================================
# МЫСАЛ 3: Статикалық веб-сайт хостингі
# =====================================================================
resource "docker_image" "app_img" {
  name         = "nexthost_app:latest"
  keep_locally = true
}

resource "docker_container" "app_container" {
  name  = "nexthost_web"
  image = docker_image.app_img.image_id

  # ОСЫ ЕКІ АЙНЫМАЛЫНЫ ҚОС:
  env = [
    "DB_HOST=nexthost_db",
    "DB_NAME=nexthost",
    "DB_USER=nexthost_user",
    "DB_PASS=secretpassword"
  ]
  
  ports {
    internal = 80
    external = 80
  }

  networks_advanced {
    name = docker_network.nexthost_vpc.name
  }

  volumes {
    host_path      = "C:/xampp/htdocs/nexthost"
    container_path = "/var/www/html"
  }

  depends_on = [docker_container.db_container]
}

# =====================================================================
# ПРОМЕТЕЙ МЕН ГРАФАНА (Мониторинг)
# =====================================================================
resource "docker_image" "prometheus_img" {
  name = "prom/prometheus:latest"
}

resource "docker_container" "prometheus" {
  name  = "prometheus"
  image = docker_image.prometheus_img.image_id
  ports {
    internal = 9090
    external = 9090
  }
  volumes {
    host_path      = "C:/xampp/htdocs/nexthost/prometheus.yml" 
    container_path = "/etc/prometheus/prometheus.yml"
  }
}

resource "docker_image" "grafana_img" {
  name = "grafana/grafana:latest"
}

resource "docker_container" "grafana" {
  name  = "grafana"
  image = docker_image.grafana_img.image_id
  ports {
    internal = 3000
    external = 3000
  }
  volumes {
    host_path      = "C:/xampp/htdocs/nexthost/grafana_data"
    container_path = "/var/lib/grafana"
  }
}

# =====================================================================
# МЫСАЛ 4: Jenkins CI/CD
# =====================================================================
resource "docker_image" "jenkins_img" {
  name         = "nexthost_jenkins:latest"
  keep_locally = true  
}

resource "docker_container" "jenkins" {
  name  = "jenkins_server"
  image = docker_image.jenkins_img.image_id
  user  = "root"
  lifecycle {
    ignore_changes = all
  }
  ports {
    internal = 8080
    external = 8080
  }
  ports {
    internal = 50000
    external = 50000
  }
  volumes {
    host_path      = "${abspath(path.module)}/jenkins_data"
    container_path = "/var/jenkins_home"
  }
  volumes {
    host_path      = "/var/run/docker.sock" 
    container_path = "/var/run/docker.sock"
  }
  volumes {
    host_path      = abspath(path.module)
    container_path = "/var/nexthost_project"
  }
}

# =====================================================================
# МЫСАЛ 5: n8n (ИИ-Ассистент)
# =====================================================================
resource "docker_image" "n8n_img" {
  name = "docker.n8n.io/n8nio/n8n:latest"
}

resource "docker_container" "n8n" {
  name  = "n8n_server"
  image = docker_image.n8n_img.image_id

  env = [
    "WEBHOOK_URL=https://monetize-gorged-repugnant.ngrok-free.dev",
    "N8N_CORS_ALLOWED_ORIGINS=*"
  ]

  ports {
    internal = 5678
    external = 5678
  }

  volumes {
    host_path      = "C:/xampp/htdocs/nexthost/n8n_data_v2"
    container_path = "/home/node/.n8n"
  }
}

resource "docker_image" "node_exporter_img" {
  name = "prom/node-exporter:latest"
}

resource "docker_container" "node_exporter" {
  name  = "node_exporter_server"
  image = docker_image.node_exporter_img.image_id
  ports {
    internal = 9100
    external = 9100
  }
}

# ─── TELEGRAM BOT ─────────────────────────────────────────────────────────────
resource "docker_image" "tgbot_img" {
  name         = "nexthost_tgbot:latest"
  keep_locally = true   
}

resource "docker_container" "tgbot" {
  name  = "tgbot_server"
  image = docker_image.tgbot_img.image_id

  networks_advanced {
    name = docker_network.nexthost_vpc.name
  }

  env = [
    "BOT_TOKEN=${var.bot_token}",
    "ADMIN_CHAT_ID=${var.admin_chat_id}",
    "PROMETHEUS_URL=http://host.docker.internal:9090",
    "DOCKER_HOST=http://host.docker.internal:2375",
  ]
  volumes {
    host_path      = "/var/run/docker.sock"
    container_path = "/var/run/docker.sock"
  }
  depends_on = [
    docker_container.prometheus,
    docker_container.node_exporter,
  ]
}

# =====================================================================
# МЫСАЛ 6: CI/CD және Автоматтандыру 
# =====================================================================
resource "null_resource" "trigger_pipeline" {
  depends_on = [
    docker_container.app_container,
    docker_container.tgbot
  ]

  provisioner "local-exec" {
    command = <<EOT
      echo "Nexthost infra kurildi!" > deploy_status.txt
      echo "Starting Ansible configuration check..." >> deploy_status.txt
    EOT
  }
}