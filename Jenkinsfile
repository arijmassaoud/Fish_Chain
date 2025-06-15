pipeline {
    agent any

    stages {
        stage('Clone Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/youruser/yourweb.git' 
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t my-web-app:latest .'
            }
        }

        stage('Stop Running Container') {
            steps {
                sh 'docker rm -f my-web-app || echo "No running container"'
            }
        }

        stage('Run New Container') {
            steps {
                sh 'docker run -d -p 80:3000 --name my-web-app my-web-app:latest'
            }
        }
    }
}