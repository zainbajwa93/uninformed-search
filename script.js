const graph = {}; // Dynamic graph created by the user
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const queueList = document.getElementById('queueList');
const addEdgeForm = document.getElementById('addEdgeForm');
const startBFSButton = document.getElementById('startBFSButton');
const startDFSButton = document.getElementById('startDFSButton');
const startUCSButton = document.getElementById('startUCSButton');
const resetButton = document.getElementById('resetButton');

let steps = [];
let stepIndex = 0;
let interval = null;

const positions = {}; // Node positions for drawing

// Helper: Add edge to the graph
function addEdge(from, to, cost) {
    if (!graph[from]) graph[from] = [];
    if (!positions[from]) positions[from] = randomPosition();
    if (!positions[to]) positions[to] = randomPosition();

    graph[from].push({ node: to, cost });
    drawGraph();
}

// Helper: Generate random positions for nodes
function randomPosition() {
    return { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50 };
}

// Helper: Draw the graph
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const from in graph) {
        for (const edge of graph[from]) {
            const to = edge.node;
            const start = positions[from];
            const end = positions[to];

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw cost
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            ctx.fillStyle = 'black';
            ctx.fillText(edge.cost, midX, midY);
        }
    }

    for (const node in positions) {
        const { x, y } = positions[node];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.fillText(node, x - 5, y + 5);
    }
}

// Update priority queue in UI
function updateQueueUI(queue) {
    queueList.innerHTML = '';
    for (const item of queue) {
        const li = document.createElement('li');
        li.textContent = `${item.node}: ${item.cost || ''}`;
        queueList.appendChild(li);
    }
}

// Breadth-First Search (BFS)
function bfs(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, path: [start], cost: 0 }];
    const steps = [];

    while (queue.length > 0) {
        const current = queue.shift();
        steps.push(current);

        if (!visited.has(current.node)) {
            visited.add(current.node);

            if (current.node === goal) break;

            for (const neighbor of graph[current.node] || []) {
                const newCost = current.cost + neighbor.cost;
                queue.push({ node: neighbor.node, path: [...current.path, neighbor.node], cost: newCost });
            }
        }
        updateQueueUI(queue);
    }
    return steps;
}

// Depth-First Search (DFS)
function dfs(start, goal) {
    const visited = new Set();
    const stack = [{ node: start, path: [start], cost: 0 }];
    const steps = [];

    while (stack.length > 0) {
        const current = stack.pop();
        steps.push(current);

        if (!visited.has(current.node)) {
            visited.add(current.node);

            if (current.node === goal) break;

            for (const neighbor of graph[current.node] || []) {
                const newCost = current.cost + neighbor.cost;
                stack.push({ node: neighbor.node, path: [...current.path, neighbor.node], cost: newCost });
            }
        }
        updateQueueUI(stack);
    }
    return steps;
}

// Uniform-Cost Search (UCS)
function uniformCostSearch(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, cost: 0, path: [start] }];
    const steps = [];

    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost);

        const current = queue.shift();
        steps.push(current);

        if (!visited.has(current.node)) {
            visited.add(current.node);

            if (current.node === goal) break;

            for (const neighbor of graph[current.node] || []) {
                queue.push({
                    node: neighbor.node,
                    cost: current.cost + neighbor.cost,
                    path: [...current.path, neighbor.node],
                });
            }
        }
        updateQueueUI(queue);
    }
    return steps;
}

// Visualize each step
function visualizeStep() {
    if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        const currentNode = positions[step.node];
        ctx.beginPath();
        ctx.arc(currentNode.x, currentNode.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();

        stepIndex++;
    } else {
        clearInterval(interval);
    }
}

// Reset the graph and UI
function reset() {
    steps = [];
    stepIndex = 0;
    Object.keys(graph).forEach(key => delete graph[key]);
    Object.keys(positions).forEach(key => delete positions[key]);
    queueList.innerHTML = '';
    drawGraph();
}

// Add edge form submission
addEdgeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const from = document.getElementById('fromNode').value.toUpperCase();
    const to = document.getElementById('toNode').value.toUpperCase();
    const cost = parseInt(document.getElementById('cost').value, 10);

    addEdge(from, to, cost);
    addEdgeForm.reset();
});

// Start BFS
startBFSButton.addEventListener('click', () => {
    const startNode = prompt('Enter start node:').toUpperCase();
    const goalNode = prompt('Enter goal node:').toUpperCase();
    steps = bfs(startNode, goalNode);
    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

// Start DFS
startDFSButton.addEventListener('click', () => {
    const startNode = prompt('Enter start node:').toUpperCase();
    const goalNode = prompt('Enter goal node:').toUpperCase();
    steps = dfs(startNode, goalNode);
    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

// Start UCS
startUCSButton.addEventListener('click', () => {
    const startNode = prompt('Enter start node:').toUpperCase();
    const goalNode = prompt('Enter goal node:').toUpperCase();
    steps = uniformCostSearch(startNode, goalNode);
    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

// Reset graph
resetButton.addEventListener('click', reset);

// Function to reset graph colors to default
function resetGraphColors() {
    drawGraph(); // Re-draw the graph in its default state
}

// Reset Colors button functionality
const resetColorsButton = document.getElementById('resetColorsButton');
resetColorsButton.addEventListener('click', resetGraphColors);

// Initialize
drawGraph();
// Example usage: resetting after running an algorithm
function visualizeStep() {
    if (stepIndex < steps.length) {
        // Highlight current node
        const step = steps[stepIndex];
        const currentNode = positions[step.node];

        // Reset graph colors before highlighting
        resetGraphColors();

        ctx.beginPath();
        ctx.arc(currentNode.x, currentNode.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();

        stepIndex++;
    } else {
        clearInterval(interval);
    }
}