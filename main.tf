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
# МЫСАЛ 1: Желіні оқшаулау (Бастапқы код: SAMPLE01-EC2-VPC)
# AWS VPC орнына Docker жеке желісін құрамыз (Контейнерлер осыған қосылады)
# =====================================================================
resource "docker_network" "nexthost_vpc" {
  name = "nexthost_private_network"
}

# =====================================================================
# МЫСАЛ 2: Тұрақты деректерді сақтау (Бастапқы код: SAMPLE03-EBS-EFS)
# AWS EBS дискісінің орнына Docker Volume қолданамыз (Мәліметтер базасы үшін)
# =====================================================================
resource "docker_volume" "db_storage" {
  name = "nexthost_db_data"
}

# Образ для базы данных
resource "docker_image" "mariadb_img" {
  name = "mariadb:10.6"
}

# Контейнер базы данных
resource "docker_container" "db_container" {
  name  = "nexthost_db"
  image = docker_image.mariadb_img.image_id
  
  env = [
    "MYSQL_ROOT_PASSWORD=root_password",
    "MYSQL_DATABASE=nexthost_db",
    "MYSQL_USER=user",
    "MYSQL_PASSWORD=password"
  ]

  ports {
    internal = 3306
    external = 3306
  }

  # Қосылған: Желіге және Volume-ге қосу
  networks_advanced {
    name = docker_network.nexthost_vpc.name
  }
  volumes {
    volume_name    = docker_volume.db_storage.name
    container_path = "/var/lib/mysql"
  }
}

# =====================================================================
# МЫСАЛ 3: Статикалық веб-сайт хостингі (Бастапқы код: SAMPLE08-S3-CloudFront)
# AWS S3 бакетінің орнына біз өз сайтыңды (nexthost_app) көтереміз
# =====================================================================
resource "docker_image" "app_img" {
  name         = "nexthost_app:latest"
  keep_locally = true
}

resource "docker_container" "app_container" {
  name  = "nexthost_web"
  image = docker_image.app_img.image_id
  
  ports {
    internal = 80
    external = 80
  }

  networks_advanced {
    name = docker_network.nexthost_vpc.name
  }

  depends_on = [docker_container.db_container]
}

# Образ для Prometheus
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
# МЫСАЛ 4: Контейнерлерді басқару (Бастапқы код: SAMPLE04-ECS-ELB)
# AWS ECS кластерінің орнына Docker микросервистерін (Jenkins CI/CD) іске қосамыз
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
# МЫСАЛ 5: API Gateway / Webhook (Бастапқы код: SAMPLE02-Lambda-API-Gateway)
# n8n арқылы сырттан келетін сұраныстарды қабылдайтын API шлюзін (Webhook) ашамыз
# =====================================================================
resource "docker_image" "n8n_img" {
  name = "docker.n8n.io/n8nio/n8n:latest"
}

resource "docker_container" "n8n" {
  name  = "n8n_server"
  image = docker_image.n8n_img.image_id

  env = [
    "WEBHOOK_URL=https://lwtsn-84-240-216-182.run.pinggy-free.link"
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
# МЫСАЛ 6: CI/CD және Автоматтандыру (Бастапқы код: SAMPLE07-CodeCommit-Pipeline)
# AWS CodePipeline орнына local-exec арқылы скрипттерді автоматты орындаймыз
# Бұл СРО 2-дегі Ansible үшін дайындық!
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