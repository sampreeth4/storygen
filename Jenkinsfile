pipeline {
  agent any
  options {
    skipDefaultCheckout(true)  // <- stop the automatic Declarative checkout
  }
  environment {
    DOCKER_HUB_USER = 'sampreeth455'
    DOCKER_IMAGE    = 'storygen-backend'
    OPENAI_API_KEY  = credentials('openai-key')
  }
  stages {
    stage('Checkout') {
      steps {
        // Explicit, clean checkout
        deleteDir() // ensures empty workspace each run
        git branch: 'main', url: 'https://github.com/sampreeth4/storygen.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $DOCKER_HUB_USER/$DOCKER_IMAGE ./backend'
      }
    }

    stage('Run Container Locally') {
      steps {
        sh '''
          docker stop storygen || true
          docker rm storygen || true
          docker run -d -p 5000:5000 \
            -e OPENAI_API_KEY=$OPENAI_API_KEY \
            --name storygen $DOCKER_HUB_USER/$DOCKER_IMAGE
        '''
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_HUB_USER" --password-stdin
            docker push $DOCKER_HUB_USER/$DOCKER_IMAGE
          '''
        }
      }
    }

    stage('Cleanup') {
      steps {
        sh 'docker system prune -f || true'
      }
    }
  }
}
