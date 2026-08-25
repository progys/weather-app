CLUSTER_NAME := weather
IMAGE_NAME := weather-app
IMAGE_TAG := local

.PHONY: up down build deploy status logs port clean

## Start everything: cluster + build + deploy
up: cluster build deploy status

## Delete cluster and all resources
down:
	kind delete cluster --name $(CLUSTER_NAME)

## Create kind cluster
cluster:
	@which kind >/dev/null 2>&1 || (echo "Installing kind..." && curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind)
	@kind get clusters 2>/dev/null | grep -q $(CLUSTER_NAME) && echo "Cluster $(CLUSTER_NAME) already exists" || \
		kind create cluster --name $(CLUSTER_NAME) --wait 60s

## Build image and load into kind
build: cluster
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	kind load docker-image $(IMAGE_NAME):$(IMAGE_TAG) --name $(CLUSTER_NAME)

## Apply manifests
deploy: build
	kubectl apply -f k8s/
	kubectl rollout status deployment/weather-app --timeout=120s

## Show status
status:
	@echo "=== Pods ==="
	@kubectl get pods -l app=weather-app
	@echo "\n=== Service ==="
	@kubectl get svc weather-app
	@echo "\n=== Curl test ==="
	@kubectl exec deployment/weather-app -- curl -s http://localhost:3000/api/weather | head -c 200

## Tail logs
logs:
	kubectl logs -l app=weather-app -f

## Port-forward to localhost:3000
port:
	@echo "Forwarding to localhost:3000 (Ctrl+C to stop)"
	@kubectl port-forward svc/weather-app 3000:3000

## Remove image from kind
clean:
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || true
