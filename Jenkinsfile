// pipeline {
//     agent any

//     environment {
//         DOCKER_HUB_USER = 'sampreeth455'   // <-- replace with your DockerHub username
//         DOCKER_IMAGE = 'storygen-backend'
//         OPENAI_API_KEY = credentials('openai-key')  // <-- we'll set this in Jenkins
//     }

//     stages {
//         stage('Clone Repository') {
//             steps {
//                 git branch: 'main', url: 'https://github.com/sampreeth4/storygen.git'
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     sh 'docker build -t $DOCKER_HUB_USER/$DOCKER_IMAGE ./backend'
//                 }
//             }
//         }

//         stage('Run Container Locally') {
//             steps {
//                 script {
//                     // Stop old container if exists
//                     sh 'docker stop storygen || true && docker rm storygen || true'
//                     // Run new one
//                     sh 'docker run -d -p 5000:5000 -e OPENAI_API_KEY=$OPENAI_API_KEY --name storygen $DOCKER_HUB_USER/$DOCKER_IMAGE'
//                 }
//             }
//         }

//         stage('Push to Docker Hub') {
//             steps {
//                 withCredentials([string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASS')]) {
//                     sh 'echo $DOCKER_PASS | docker login -u $DOCKER_HUB_USER --password-stdin'
//                     sh 'docker push $DOCKER_HUB_USER/$DOCKER_IMAGE'
//                 }
//             }
//         }

//         stage('Cleanup') {
//             steps {
//                 sh 'docker system prune -f'
//             }
//         }
//     }
// }
pipeline {
  agent any
  stages {
    stage('Check Docker') {
      steps { sh 'docker --version && docker info | head -n 20' }
    }
  }
}
