<h2> The documentation of the ultimate CI/CD pipeline of DEPI's DevOps track by team 2 of group ONL2_SWD1_S1</h2>

<h5>Group Members</h5>
<ol>
  <li>Mahmoud AbdEl-Baset Mohamed</li>
  <li>Marwan Mobark Omar Mohamed</li>
  <li>Mosab Mahmoud AbdelRahman</li>
  <li>Yousef Ahmed Samy</li>
  <li>Youssef Khalid Abdullah Ali</li>
</ol>

<h3>Phase 1: Setup Infra</h3>
<hr>

<h3>Phase 2: Private Git Setup</h3>
<p>In this phase, we will set up a repository to store a copy of the software we will use for the pipeline.</p>

<ol>
  <li>Pull <a href="https://github.com/jaiswaladi246/Boardgame" target="_blank">this repository</a> to your local machine.</li>
  <li>Create a public repository on your GitHub account.</li>
  <li>Push the downloaded software to your new repository.</li>
</ol>

<h3>Phase 3: CI/CD</h3>
<p>In this phase, we will build the ultimate CI/CD pipeline to manage our application.</p>

<h4>Set up Jenkins</h4>
<h5><strong>Step 1:</strong> Install the following plugins:</h5>
<ul>
  <li>Eclipse Temurin Installer</li>
  <li>Pipeline Maven Integration</li>
  <li>Config File Provider</li>
  <li>SonarQube Scanner</li>
  <li>Kubernetes CLI</li>
  <li>Kubernetes</li>
  <li>Docker</li>
  <li>Docker Pipeline</li>
  <li>Maven Integration</li>
</ul>

<h5><strong>Step 2:</strong> Create the following tools:</h5>
<ul>
  <li><strong>JDK:</strong> Choose JDK, name it (e.g., jdk17), and select JDK 17.</li>
  <li><strong>Sonar Scanner:</strong> Name it (e.g, sonar_scanner) and select version 7.0.2.4839.</li>
  <li><strong>Maven:</strong> Name it (e.g, maven3) and select version 3.6.1.</li>
  <li><strong>Docker:</strong> Name it (e.g, docker) and choose the latest version.</li>
</ul>

<h5><strong>Step 3:</strong> Create the necessary credentials:</h5>
<ul>
  <li><strong>Git Token:</strong> Create a GitHub token, then add it as "Username with password", choose a username and set the password as the token.</li>
  <li><strong>Sonar Token:</strong> In SonarQube, go to <code>Administration → Security</code> to create an admin token. Save it as a "Secret text" credential in Jenkins.</li>
  <li><strong>DockerHub:</strong> Generate an access token in DockerHub and store it as "Username with password", choose a username and set the password as the token.</li>
  <li><strong>Kubernetes:</strong> Create and apply the necessary the following files.
    svc.yml
  <pre>
apiVersion: v1
kind: ServiceAccount
metadata:
  name: jenkins
  namespace: webapps
</pre>
role.yml
<pre>
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-role
  namespace: webapps
rules:
  - apiGroups: ["", "apps", "autoscaling", "batch", "extensions", "policy", "rbac.authorization.k8s.io"]
    resources: ["pods", "secrets", "componentstatuses", "configmaps", "daemonsets", "deployments", "events", "endpoints", "horizontalpodautoscalers", "ingress", "jobs", "limitranges", "namespaces", "nodes", "persistentvolumes", "persistentvolumeclaims", "resourcequotas", "replicasets", "replicationcontrollers", "serviceaccounts", "services"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
</pre>
bind.yml
<pre>
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-rolebinding
  namespace: webapps
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: app-role
subjects:
  - namespace: webapps
    kind: ServiceAccount
    name: jenkins
</pre>
sec.yml
<pre>
apiVersion: v1
kind: Secret
type: kubernetes.io/service-account-token
metadata:
  name: mysecretname
  annotations:
    kubernetes.io/service-account.name: jenkins
</pre>

<p>Apply the files using:</p>
<pre>kubectl apply -f .</pre>
<b>Note: apply the sec.yml file to the webapps namespace</b> 
<p>copy the token with:</p>
<pre>kubectl describe secret mysecretname -n webapps</pre>

<p>Save it as a "Secret text" credential in Jenkins.</p>
  </li>
  <li><strong>Email:</strong> Set up an app password for email notifications.
<ul>
  <li>Go to your Google account → Security → Enable 2FA → Create an App Password.</li>
  <li>Save the generated app password.</li>
  <li>In Jenkins, create a "Username with password" credential using your email and app password.
  <b>Note: save the app password for later</b>
  </li>
</ul>
  </li>
</ul>

<h5>Step 4: Configure Jenkins Server Settings</h5>
<ul>
  <li>Navigate to <strong>SonarQube installations</strong>, add the IP of your SonarQube server and Sonar token, and name the server (e.g., sonar_server).</li>
  <li>In <strong>Extended Email Notifications</strong>, set the SMTP server (smtp.google.com if you are using gmail), enable SSL, and set the port to 465.</li>
  <li>In <strong>Email Notification</strong>, configure SMTP settings and add your email as your username and app password as password</li>
</ul>

<h5>Step 5: Add Webhook to SonarQube Server</h5>
<p>Navigate to <code>SonarQube → Configuration → Webhooks</code> and add:</p>
<pre>http://your-jenkins-ip:8080/sonarqube-webhook/</pre>

<h5>Step 6: Add Nexus URL to pom.xml</h5>
<p>Go to the <code>pom.xml</code> file in the root of the repository, scroll to the end, and change the IP addresses on lines 123 and 127 to match your Nexus server.</p>

<h4>pipeline</h4>
<pre>
  ```groovy
  pipeline {
    agent any
    tools {
        jdk 'jdk17'
        maven 'maven3'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', credentialsId: 'git-cred', url: 'https://github.com/ganeshperumal007/Boardgame.git'
            }
        }
        stage('Compile') {
            steps {
                sh "mvn compile"
            }
        }
        stage('Test') {
            steps {
                sh "mvn test"
            }
        }
        stage('File System Scan') {
            steps {
                sh "trivy fs --format table -o trivy-fs-report.html ."
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar') {
                    sh '''$SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectName=BoardGame \
                        -Dsonar.projectKey=BoardGame \
                        -Dsonar.java.binaries=.'''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                }
            }
        }
        stage('Build') {
            steps {
                sh "mvn package"
            }
        }
        stage('Publish To Nexus') {
            steps {
                withMaven(globalMavenSettingsConfig: 'global-settings', jdk: 'jdk17', maven: 'maven3', mavenSettingsConfig: '', traceability: true) {
                    sh "mvn deploy"
                }
            }
        }
        stage('Build & Tag Docker Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                        sh "docker build -t ganeshperumal007/boardshack:latest ."
                    }
                }
            }
        }
        stage('Docker Image Scan') {
            steps {
                sh "trivy image --format table -o trivy-image-report.html ganeshperumal007/boardshack:latest"
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                        sh "docker push ganeshperumal007/boardshack:latest"
                    }
                }
            }
        }
        stage('Deploy To Kubernetes') {
            steps {
                withKubeConfig(
                    caCertificate: '',
                    clusterName: 'kubernetes',
                    contextName: '',
                    credentialsId: 'k8-cred',
                    namespace: 'webapps',
                    restrictKubeConfigAccess: false,
                    serverUrl: 'https://172.31.8.146:6443'
                ) {
                    sh "kubectl apply -f deployment-service.yaml"
                }
            }
        }
        stage('Verify the Deployment') {
            steps {
                withKubeConfig(
                    caCertificate: '',
                    clusterName: 'kubernetes',
                    contextName: '',
                    credentialsId: 'k8-cred',
                    namespace: 'webapps',
                    restrictKubeConfigAccess: false,
                    serverUrl: 'https://172.31.8.146:6443'
                ) {
                    sh "kubectl get pods -n webapps"
                    sh "kubectl get svc -n webapps"
                }
            }
        }
    }
    post {
        always {
            script {
                def jobName = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def pipelineStatus = currentBuild.result ?: 'UNKNOWN'
                def bannerColor = pipelineStatus.toUpperCase() == 'SUCCESS' ? 'green' : 'red'
                def body = """
                    <html>
                    <body>
                        <div style="border: 4px solid ${bannerColor}; padding: 10px;">
                            <h2>${jobName} - Build ${buildNumber}</h2>
                            <div style="background-color: ${bannerColor}; padding: 10px;">
                                <h3 style="color: white;">Pipeline Status: ${pipelineStatus.toUpperCase()}</h3>
                            </div>
                            <p>Check the <a href="${BUILD_URL}">console output</a>.</p>
                        </div>
                    </body>
                    </html>
                """
                emailext(
                    subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus.toUpperCase()}",
                    body: body,
                    to: 'example@gmail.com',
                    from: 'jenkins@example.com',
                    replyTo: 'jenkins@example.com',
                    mimeType: 'text/html',
                    attachmentsPattern: 'trivy-image-report.html'
                )
            }
        }
    }
}
```
</pre>
<h1>Phase 4: Monitoring with Prometheus, Grafana, and Exporters</h1>
<h2>Overview</h2>
<p>This phase sets up monitoring for the CI/CD pipeline, Kubernetes cluster, and application health using:</p>
    <ul>
        <li><strong>Prometheus</strong>: Metrics collection and alerting</li>
        <li><strong>Grafana</strong>: Visualization dashboards</li>
        <li><strong>Node Exporter</strong>: Host-level metrics (CPU, memory, disk)</li>
        <li><strong>Blackbox Exporter</strong>: HTTP/HTTPS endpoint monitoring</li>
    </ul>
<h2>Prerequisites</h2>
<h3>1. EC2 Instance</h3>
    <ul>
        <li>Type: <code>t2.medium</code> (Ubuntu 22.04)</li>
        <li>Security Group: Open ports:
            <ul>
                <li><code>9091</code> (Prometheus)</li>
                <li><code>3000</code> (Grafana)</li>
                <li><code>9100</code> (Node Exporter)</li>
                <li><code>9115</code> (Blackbox Exporter)</li>
            </ul>
        </li>
    </ul>
<h3>2. Jenkins Server</h3>
<p>Ensure Prometheus metrics plugin is installed (<code>Metrics</code> plugin).</p>

   <h2>Installation Guide</h2>

  <h3>1. Install Prometheus</h3>
    <pre><code>sudo apt update
wget https://github.com/prometheus/prometheus/releases/download/v2.54.0/prometheus-2.54.0.linux-amd64.tar.gz
tar -xvf prometheus-*.tar.gz
cd prometheus-*/
./prometheus --config.file=prometheus.yml &amp;</code></pre>
    <p>Access Prometheus at: <code>http://&lt;EC2_IP&gt;:9091</code></p>

   <h3>2. Install Grafana</h3>
    <pre><code>sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/enterprise/release/grafana-enterprise_11.1.4_amd64.deb
sudo dpkg -i grafana-*.deb
sudo systemctl start grafana-server</code></pre>
    <p>Access Grafana at: <code>http://&lt;EC2_IP&gt;:3000</code> (Default login: <code>admin/admin</code>)</p>

   <h3>3. Install Node Exporter</h3>
    <pre><code>wget https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz
tar -xvf node_exporter-*.tar.gz
cd node_exporter-*/
./node_exporter &amp;
curl http://localhost:9100/metrics</code></pre>

   <h3>4. Install Blackbox Exporter</h3>
    <pre><code>wget https://github.com/prometheus/blackbox_exporter/releases/download/v0.25.0/blackbox_exporter-0.25.0.linux-amd64.tar.gz
tar -xvf blackbox_exporter-*.tar.gz
cd blackbox_exporter-*/
./blackbox_exporter &amp;
curl http://localhost:9115/metrics</code></pre>

   <h3>5. Configure Prometheus Targets</h3>
    <p>Edit <code>prometheus.yml</code> and add:</p>
    <pre><code>scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'Jenkins'
    metrics_path: '/prometheus'
    static_configs:
      - targets: ['&lt;JENKINS_IP&gt;:8080']

  - job_name: 'blackbox'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - http://&lt;APPLICATION_IP&gt;:31508
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: localhost:9115</code></pre>
    <p>Restart Prometheus:</p>
    <pre><code>kill $(pgrep prometheus)
./prometheus --config.file=prometheus.yml &amp;</code></pre>

   <h3>6. Import Grafana Dashboards</h3>
    <ul>
        <li>Add Prometheus Data Source: <code>http://localhost:9091</code></li>
        <li>Import Dashboards:
            <ul>
                <li>Node Exporter: Dashboard ID <code>1860</code></li>
                <li>Blackbox Exporter: Dashboard ID <code>7587</code></li>
            </ul>
        </li>
    </ul>

   <h3>7. Monitor Jenkins</h3>
    <p>Install Prometheus Metrics Plugin in Jenkins:</p>
    <ul>
        <li>Jenkins → Manage Plugins → Install <code>Metrics</code> plugin</li>
        <li>Expose Metrics: <code>http://&lt;JENKINS_IP&gt;:8080/prometheus</code></li>
    </ul>

   <h2>Troubleshooting</h2>
    <ul>
        <li><strong>Prometheus Not Starting:</strong> Check config syntax: <code>./promtool check config prometheus.yml</code></li>
        <li><strong>Grafana Login Issues:</strong> Reset password: <code>sudo grafana-cli admin reset-admin-password newpassword</code></li>
        <li><strong>Firewall Issues:</strong> Ensure required ports are open in security group</li>
    </ul>
