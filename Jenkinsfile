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
      sh(label: 'Notify Discord', script: '''#!/usr/bin/env bash
set -e

payload=$(cat <<EOF
{
  "content": "❌ CI Build Failed\\nName: 潘芊寧\\nStudent ID: B12705005\\nJob: ${JOB_NAME}\\nBuild: ${BUILD_NUMBER}\\nRepo: ${GIT_URL}\\nBranch: ${BRANCH_NAME}\\nStatus: FAILURE"
}
EOF
)

curl -sS -H "Content-Type: application/json" -X POST -d "$payload" "$WEBHOOK" >/dev/null
''')
    }
  }
}

