pipeline {
  agent any
  options { timestamps() }

  environment {
    DOCKERHUB_USER = 'm499i3'
    IMAGE_NAME     = 'm499i3/lsap-hw6'   // Docker Hub repo name
    APP_PORT       = '3000'             // container listens on this
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.REPO_URL = sh(returnStdout: true, script: "git config --get remote.origin.url").trim()
        }
      }
    }

    // Part 1: must run on ALL branches
    stage('Static Analysis') {
      steps {
        sh 'npm ci'
        sh 'npm run lint'
      }
    }

    // Part 2A: Staging on dev
    stage('Dev: Build & Push') {
      when { branch 'dev' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CREDS', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''#!/bin/bash
            set -e
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker build -t "$IMAGE_NAME:dev-$BUILD_NUMBER" .
            docker push "$IMAGE_NAME:dev-$BUILD_NUMBER"
          '''
        }
      }
    }

    stage('Dev: Deploy & Verify') {
      when { branch 'dev' }
      steps {
        sh '''#!/bin/bash
          set -e
          docker rm -f dev-app >/dev/null 2>&1 || true
          docker run -d --name dev-app -p 8081:$APP_PORT "$IMAGE_NAME:dev-$BUILD_NUMBER"
          sleep 2
          curl -fsS http://localhost:8081/health
        '''
      }
    }

    // Part 2B: Production on main (GitOps promotion)
    stage('Prod: Read deploy.config') {
      when { branch 'main' }
      steps {
        script {
          env.TARGET_TAG = readFile('deploy.config').trim()
          if (!env.TARGET_TAG) {
            error("deploy.config is empty. Put something like: dev-15")
          }
        }
      }
    }

    stage('Prod: Promote (Pull/Retag/Push)') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CREDS', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''#!/bin/bash
            set -e
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker pull "$IMAGE_NAME:$TARGET_TAG"
            docker tag  "$IMAGE_NAME:$TARGET_TAG" "$IMAGE_NAME:prod-$BUILD_NUMBER"
            docker push "$IMAGE_NAME:prod-$BUILD_NUMBER"
          '''
        }
      }
    }

    stage('Prod: Deploy & Verify') {
      when { branch 'main' }
      steps {
        sh '''#!/bin/bash
          set -e
          docker rm -f prod-app >/dev/null 2>&1 || true
          docker run -d --name prod-app -p 8082:$APP_PORT "$IMAGE_NAME:prod-$BUILD_NUMBER"
          sleep 2
          curl -fsS http://localhost:8082/health
        '''
      }
    }
  }

  post {
    failure {
      withCredentials([string(credentialsId: 'CHAT_WEBHOOK_URL', variable: 'WEBHOOK')]) {
        sh '''#!/bin/bash
          set -e
          NAME="潘芊寧"
          SID="B12705005"
          STATUS="FAILURE"
          REPO="${REPO_URL:-$GIT_URL}"

          MSG="❌ CI Build Failed\\nName: ${NAME}\\nStudent ID: ${SID}\\nJob: ${JOB_NAME}\\nBuild: ${BUILD_NUMBER}\\nRepo: ${REPO}\\nBranch: ${BRANCH_NAME}\\nStatus: ${STATUS}"

          python3 - <<PY | curl -s -H "Content-Type: application/json" -X POST -d @- "$WEBHOOK" >/dev/null
import json
msg = """${MSG}"""
print(json.dumps({"content": msg}))
PY
        '''
      }
    }
  }
}
