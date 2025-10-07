pipeline {
  agent any

  options {
    skipDefaultCheckout(true)   // avoid the implicit "Declarative: Checkout SCM"
    timestamps()
  }

  environment {
    DOCKER_HUB_USER   = 'sampreeth455'
    DOCKER_IMAGE      = 'storygen-backend'
    DOCKER_IMAGE_REPO = "${DOCKER_HUB_USER}/${DOCKER_IMAGE}"
    OPENAI_API_KEY    = credentials('openai-key')   // Jenkins "Secret text" with your API key
  }

  stages {

    stage('Checkout') {
      steps {
        // ensure a clean workspace and do an explicit clone
        deleteDir()
        git branch: 'main', url: 'https://github.com/sampreeth4/storygen.git'
      }
    }

    stage('Set Image Tag') {
      steps {
        script {
          // use short git SHA as the image tag (fallback to "latest")
          env.IMAGE_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          if (!env.IMAGE_TAG) { env.IMAGE_TAG = 'latest' }
          echo "Using image tag: ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          docker build \
            -t $DOCKER_IMAGE_REPO:$IMAGE_TAG \
            -t $DOCKER_IMAGE_REPO:latest \
            ./backend
        '''
      }
    }

    stage('Run Container Locally') {
      steps {
        sh '''
          docker stop storygen || true
          docker rm storygen || true

          docker run -d --name storygen \
            -p 5000:5000 \
            -e OPENAI_API_KEY=$OPENAI_API_KEY \
            $DOCKER_IMAGE_REPO:$IMAGE_TAG

          docker ps --filter "name=storygen"
        '''
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'dockerhub-pass',  // Jenkins "Username with password"
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
          )
        ]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push $DOCKER_IMAGE_REPO:$IMAGE_TAG
            docker push $DOCKER_IMAGE_REPO:latest
            docker logout || true
          '''
        }
      }
    }

    stage('Cleanup') {
      steps {
        // keep this gentle; skip full system prune if you prefer
        sh 'docker image prune -f || true'
      }
    }
  }

  post {
    always {
      echo "Build finished with status: ${currentBuild.currentResult}"
    }
  }
}
