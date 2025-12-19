pipeline {
  agent any
  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    YOUR_NAME  = "潘芊寧"
    STUDENT_ID = "B12705005"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    // Must run on all branches and fail immediately if lint fails
    stage('Static Analysis') {
      steps {
        sh 'npm ci'
        sh 'npm run lint'
      }
    }
  }

  post {
    failure {
      withCredentials([string(credentialsId: 'CHAT_WEBHOOK_URL', variable: 'WEBHOOK')]) {
        sh '''
          payload=$(cat <<EOF
{"content":"**CI/CD Build Failed**\\nName: ${YOUR_NAME}\\nStudent ID: ${STUDENT_ID}\\nJob: ${JOB_NAME}\\nBuild: ${BUILD_NUMBER}\\nRepo: ${GIT_URL}\\nBranch: ${BRANCH_NAME}\\nStatus: ${currentBuild.currentResult}"}
EOF
)
          curl -sS -H "Content-Type: application/json" -X POST -d "$payload" "$WEBHOOK" >/dev/null
        '''
      }
    }
  }
}
