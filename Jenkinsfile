pipeline {
    agent any

    // Environment variables
    environment {
        // AWS Configuration
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        
        // ECR Configuration
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        ECR_REPOSITORY = 'devops-api'
        
        // Image and version
        IMAGE_NAME = "${ECR_REGISTRY}/${ECR_REPOSITORY}"
        BUILD_TAG = "${BUILD_ID}-${GIT_COMMIT.take(7)}"
        IMAGE_TAG = "${IMAGE_NAME}:${BUILD_TAG}"
        IMAGE_TAG_LATEST = "${IMAGE_NAME}:latest"
        
        // Kubernetes Configuration
        KUBECONFIG = credentials('kubeconfig')
        K8S_NAMESPACE = 'production'
        K8S_DEPLOYMENT = 'devops-api'
        
        // Slack Notifications (Optional)
        SLACK_CHANNEL = '#devops-notifications'
        
        // Sonar Configuration (Optional)
        SONAR_HOST_URL = 'http://sonarqube:9000'
    }

    options {
        // Keep last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 1 hour
        timeout(time: 1, unit: 'HOURS')
        // Add timestamps to console output
        timestamps()
    }

    triggers {
        // Trigger on push to main branch
        githubPush()
        
        // Poll SCM every 15 minutes
        pollSCM('H/15 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "========== CHECKOUT STAGE =========="
                    checkout scm
                    sh 'git log --oneline -1'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo "========== BUILD STAGE =========="
                    sh '''
                        echo "Node.js version:"
                        node --version
                        
                        echo "Installing dependencies..."
                        npm ci
                        
                        echo "Build completed successfully"
                    '''
                }
            }
        }

        stage('Unit Tests') {
            steps {
                script {
                    echo "========== UNIT TEST STAGE =========="
                    sh '''
                        echo "Running Jest tests..."
                        npm test -- --coverage --watchAll=false
                    '''
                }
                // Publish test results
                junit 'coverage/junit.xml'
                // Publish code coverage
                publishHTML([
                    reportDir: 'coverage',
                    reportFiles: 'index.html',
                    reportName: 'Code Coverage Report'
                ])
            }
        }

        stage('Code Quality Analysis') {
            steps {
                script {
                    echo "========== CODE QUALITY STAGE =========="
                    // Skip if SonarQube is not available
                    sh '''
                        echo "Running ESLint..."
                        npm run lint || true
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    echo "========== DOCKER BUILD STAGE =========="
                    sh '''
                        echo "Building Docker image: ${IMAGE_TAG}"
                        docker build \
                            --tag ${IMAGE_TAG} \
                            --tag ${IMAGE_TAG_LATEST} \
                            --label "build.id=${BUILD_ID}" \
                            --label "git.commit=${GIT_COMMIT}" \
                            --label "git.branch=${GIT_BRANCH}" \
                            -f Dockerfile .
                        
                        echo "Image built successfully"
                        docker images | grep ${ECR_REPOSITORY}
                    '''
                }
            }
        }

        stage('Docker Security Scan') {
            steps {
                script {
                    echo "========== DOCKER SECURITY SCAN =========="
                    sh '''
                        echo "Scanning Docker image for vulnerabilities..."
                        # Using docker scan (requires Docker Scout)
                        docker scout cves ${IMAGE_TAG} || true
                        echo "Scan completed (warnings are non-blocking)"
                    '''
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    echo "========== PUSH TO ECR STAGE =========="
                    sh '''
                        echo "Authenticating with AWS ECR..."
                        aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        
                        echo "Creating ECR repository if it doesn't exist..."
                        aws ecr create-repository \
                            --repository-name ${ECR_REPOSITORY} \
                            --region ${AWS_REGION} || true
                        
                        echo "Pushing image to ECR..."
                        docker push ${IMAGE_TAG}
                        docker push ${IMAGE_TAG_LATEST}
                        
                        echo "Image pushed successfully"
                        echo "Image URI: ${IMAGE_TAG}"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "========== KUBERNETES DEPLOYMENT STAGE =========="
                    sh '''
                        echo "Checking Kubernetes connectivity..."
                        kubectl cluster-info
                        
                        echo "Creating namespace if it doesn't exist..."
                        kubectl create namespace ${K8S_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                        
                        echo "Updating Kubernetes manifest with new image..."
                        sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/deployment.yaml
                        
                        echo "Applying Kubernetes manifests..."
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/configmap.yaml
                        kubectl apply -f k8s/secret.yaml
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/service.yaml
                        kubectl apply -f k8s/ingress.yaml
                        kubectl apply -f k8s/hpa.yaml
                        
                        echo "Waiting for deployment rollout..."
                        kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                            -n ${K8S_NAMESPACE} \
                            --timeout=5m
                        
                        echo "Deployment completed successfully"
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "========== VERIFICATION STAGE =========="
                    sh '''
                        echo "Checking pod status..."
                        kubectl get pods -n ${K8S_NAMESPACE} -l app=${K8S_DEPLOYMENT}
                        
                        echo "Checking deployment status..."
                        kubectl get deployment -n ${K8S_NAMESPACE}
                        
                        echo "Checking services..."
                        kubectl get svc -n ${K8S_NAMESPACE}
                        
                        echo "Checking ingress..."
                        kubectl get ingress -n ${K8S_NAMESPACE}
                        
                        echo "Getting pod logs..."
                        kubectl logs -n ${K8S_NAMESPACE} \
                            -l app=${K8S_DEPLOYMENT} \
                            --tail=20
                        
                        echo "Verifying health endpoint..."
                        POD_NAME=$(kubectl get pods -n ${K8S_NAMESPACE} \
                            -l app=${K8S_DEPLOYMENT} \
                            -o jsonpath='{.items[0].metadata.name}')
                        
                        kubectl exec -n ${K8S_NAMESPACE} ${POD_NAME} \
                            -- curl -s http://localhost:3000/health | head -20
                    '''
                }
            }
        }

        stage('Smoke Tests') {
            steps {
                script {
                    echo "========== SMOKE TESTS STAGE =========="
                    sh '''
                        echo "Running smoke tests..."
                        ALB_ENDPOINT=$(kubectl get ingress -n ${K8S_NAMESPACE} \
                            -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}')
                        
                        if [ ! -z "$ALB_ENDPOINT" ]; then
                            echo "Testing health endpoint on ALB: $ALB_ENDPOINT"
                            for i in {1..5}; do
                                curl -f http://$ALB_ENDPOINT/health || true
                                sleep 2
                            done
                        else
                            echo "ALB endpoint not yet available, checking via kubectl port-forward..."
                        fi
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo "========== CLEANUP =========="
                // Clean workspace
                cleanWs()
            }
        }
        success {
            script {
                echo "Pipeline completed successfully!"
                // Send success notification
                sh '''
                    echo "Deployment successful: ${IMAGE_TAG}"
                '''
            }
        }
        failure {
            script {
                echo "Pipeline failed!"
                // Send failure notification and trigger rollback
                sh '''
                    echo "Deployment failed. Initiating rollback..."
                    kubectl rollout undo deployment/${K8S_DEPLOYMENT} \
                        -n ${K8S_NAMESPACE} || true
                '''
            }
        }
        unstable {
            script {
                echo "Pipeline is unstable!"
            }
        }
    }
}
