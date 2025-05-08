# LMS DevOps Automation

This project automates the full deployment lifecycle of a Learning Management System (LMS) using Ansible and Kubernetes (K3s), along with CI/CD pipelines managed by Jenkins. It encapsulates infrastructure provisioning, application deployment (frontend, backend, MySQL), and DevOps practices using a clean Ansible role structure.

## 📁 Project Structure

```text
setup/
├── init.yml                 # Entry point playbook for setting up the LMS environment
├── roles/
│   ├── common/              # Installs general system packages and updates
│   ├── git/                 # Installs Git and handles repository cloning
│   ├── k3s/                 # Sets up K3s Kubernetes cluster (master and workers)
│   ├── jenkins/             # Deploys Jenkins, configures credentials, jobs, and service accounts
│   └── deploy/              # Deploys the backend and frontend to the Kubernetes cluster
backend/
├── dockerSetup/            # Backend Dockerfile and NGINX configuration
├── k8sSetup/               # Kubernetes manifests for Laravel app and MySQL
frontend/
├── Docker/                 # Frontend Dockerfile and NGINX config
├── k8s/                    # Frontend deployment manifest
```

## 🛠️ Prerequisites

* Control machine with **Ansible** installed
* Target machines (VMs or bare metal) with:

  * SSH access enabled
  * Ubuntu 20.04+ recommended
* Public/Private SSH key pair configured for remote access

## The current setup is for a single-node application. For multi-node setup change init.yml to this:

```ini
- name: Set up K3s Cluster
  hosts: all
  become: yes
  roles:
    - role: k3s

- name: Deploy ai-lms project
  hosts: master
  vars:
    front_path: /var/www/lms/front
    back_path: /var/www/lms/back
  vars_files:
    - Creds.yml
  become: yes
  roles:
    - role: common
    - role: git
    - role: deploy
    - role: jenkins
```

## and change k3s/tasks/main.yml to this

```ini

- include_tasks: master.yml
  when: "'master' in group_names"

- include_tasks: worker.yml
  when: "'slaves' in group_names"
```

## 🚀 How to Run

### 1. Inventory File

Prepare an inventory file (e.g. `inventory.yml`) with your IP(s):

Single-node setup:

```ini
[server]
192.168.1.10
```

Multi-node setup:

```ini
[master]
192.168.1.10

[workers]
192.168.1.11
192.168.1.12
```

### 2. Execute the Playbook

Run the main playbook:

```bash
ansible-playbook -i hosts.ini setup/init.yml
```

---

## 🔍 Walkthrough of `setup/init.yml`

This is the main entry point which calls the following roles in order:

### 1. `common`

* Updates system packages
* Installs tools like curl, unzip, etc.

### 2. `git`

* Installs Git
* Clones necessary repositories (frontend/backend)

### 3. `k3s`

* Installs a lightweight Kubernetes (K3s)
* Configures master and worker nodes
* Sets up kubeconfig

### 4. `jenkins`

* Installs Jenkins inside a Docker container
* Configures Kubernetes credentials and service account
* Creates Jenkins jobs using pre-defined XML templates
* Applies firewall rules via UFW

### 5. `deploy`

* Applies Kubernetes manifests:

  * Backend (Laravel) deployment
  * MySQL service and volume claims
  * Frontend service and deployment

---

## 🛠️ CI/CD Pipeline Details

Jenkins is used to automate deployments of both frontend and backend services:

* **Jenkins Configuration**

  * Jenkins Dockerfile and job configs are in `jenkins/files/`
  * Job templates (XML) are stored as `back.xml` and `front.xml`

* **Kubernetes Integration**

  * Service account for Jenkins is created using `jenkins_service_acc.yml`
  * A custom `kubeconfig` file is generated via Jinja template and injected into Jenkins

* **Pipeline Stages**

  1. Pull latest code from Git
  2. Build Docker images
  3. Push to container registry (optional)
  4. Apply Kubernetes manifests

---

## 🔐 Secrets Management

Sensitive files and credentials are handled as follows:

* Jenkins credentials are defined using a Jinja template: `credentials.xml.j2`
* Kubernetes `kubeconfig` for Jenkins is generated dynamically using `jenkins-kubeconfig.yml.j2`
* SSH keys and kubeconfig files should be securely stored and excluded from version control (see `.gitignore`)
* For better security, consider integrating Vault or Ansible Vault for secret encryption

---
