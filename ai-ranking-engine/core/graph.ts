export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface NodeMetrics {
  id: string;
  inDegree: number;
  outDegree: number;
  pageRank: number;
  hubScore: number;
  authorityScore: number;
}

export class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  public enqueue(item: T, priority: number): void {
    const element = { item, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (element.priority < this.items[i].priority) {
        this.items.splice(i, 0, element);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(element);
    }
  }

  public dequeue(): T | null {
    if (this.isEmpty()) return null;
    return this.items.shift()!.item;
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public size(): number {
    return this.items.length;
  }
}

export class DirectedGraph {
  private adjacencyList: Map<string, Map<string, number>>;
  private reverseAdjacencyList: Map<string, Map<string, number>>;
  private nodes: Set<string>;

  constructor() {
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
    this.nodes = new Set();
  }

  public addNode(node: string): void {
    if (!this.nodes.has(node)) {
      this.nodes.add(node);
      this.adjacencyList.set(node, new Map());
      this.reverseAdjacencyList.set(node, new Map());
    }
  }

  public addEdge(source: string, target: string, weight: number = 1.0): void {
    this.addNode(source);
    this.addNode(target);
    this.adjacencyList.get(source)!.set(target, weight);
    this.reverseAdjacencyList.get(target)!.set(source, weight);
  }

  public hasNode(node: string): boolean {
    return this.nodes.has(node);
  }

  public getNodes(): string[] {
    return Array.from(this.nodes);
  }

  public getOutNeighbors(node: string): Map<string, number> {
    return this.adjacencyList.get(node) || new Map();
  }

  public getInNeighbors(node: string): Map<string, number> {
    return this.reverseAdjacencyList.get(node) || new Map();
  }

  public computePageRank(
    dampingFactor: number = 0.85,
    maxIterations: number = 100,
    tolerance: number = 1e-6
  ): Map<string, number> {
    const nodeList = this.getNodes();
    const n = nodeList.length;
    if (n === 0) return new Map();

    const ranks = new Map<string, number>();
    const initialRank = 1.0 / n;
    for (const node of nodeList) {
      ranks.set(node, initialRank);
    }

    const baseConstant = (1.0 - dampingFactor) / n;

    for (let iter = 0; iter < maxIterations; iter++) {
      const nextRanks = new Map<string, number>();
      let maxDiff = 0;
      let sinkContribution = 0;

      for (const node of nodeList) {
        const outDegree = this.adjacencyList.get(node)!.size;
        if (outDegree === 0) {
          sinkContribution += ranks.get(node)!;
        }
      }

      const sinkRedistribution = (dampingFactor * sinkContribution) / n;

      for (const node of nodeList) {
        let incomingSum = 0;
        const inNeighbors = this.reverseAdjacencyList.get(node)!;

        for (const [inNode, weight] of inNeighbors.entries()) {
          const outEdges = this.adjacencyList.get(inNode)!;
          let totalOutWeight = 0;
          for (const w of outEdges.values()) {
            totalOutWeight += w;
          }
          if (totalOutWeight > 0) {
            incomingSum += (ranks.get(inNode)! * weight) / totalOutWeight;
          }
        }

        const newRank = baseConstant + sinkRedistribution + dampingFactor * incomingSum;
        nextRanks.set(node, newRank);
        const diff = Math.abs(newRank - ranks.get(node)!);
        if (diff > maxDiff) {
          maxDiff = diff;
        }
      }

      for (const [node, rank] of nextRanks.entries()) {
        ranks.set(node, rank);
      }

      if (maxDiff < tolerance) {
        break;
      }
    }

    return ranks;
  }

  public computeHITS(
    maxIterations: number = 50,
    tolerance: number = 1e-5
  ): { hubs: Map<string, number>; authorities: Map<string, number> } {
    const nodeList = this.getNodes();
    const n = nodeList.length;
    const hubs = new Map<string, number>();
    const authorities = new Map<string, number>();

    if (n === 0) {
      return { hubs, authorities };
    }

    for (const node of nodeList) {
      hubs.set(node, 1.0 / Math.sqrt(n));
      authorities.set(node, 1.0 / Math.sqrt(n));
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      const nextAuthorities = new Map<string, number>();
      let authNorm = 0;

      for (const node of nodeList) {
        let authSum = 0;
        const inNeighbors = this.reverseAdjacencyList.get(node)!;
        for (const [inNode, weight] of inNeighbors.entries()) {
          authSum += hubs.get(inNode)! * weight;
        }
        nextAuthorities.set(node, authSum);
        authNorm += authSum * authSum;
      }

      authNorm = Math.sqrt(authNorm);
      if (authNorm > 0) {
        for (const [node, score] of nextAuthorities.entries()) {
          authorities.set(node, score / authNorm);
        }
      }

      const nextHubs = new Map<string, number>();
      let hubNorm = 0;

      for (const node of nodeList) {
        let hubSum = 0;
        const outNeighbors = this.adjacencyList.get(node)!;
        for (const [outNode, weight] of outNeighbors.entries()) {
          hubSum += authorities.get(outNode)! * weight;
        }
        nextHubs.set(node, hubSum);
        hubNorm += hubSum * hubSum;
      }

      hubNorm = Math.sqrt(hubNorm);
      let maxDiff = 0;
      if (hubNorm > 0) {
        for (const [node, score] of nextHubs.entries()) {
          const normalized = score / hubNorm;
          const diff = Math.abs(normalized - hubs.get(node)!);
          if (diff > maxDiff) {
            maxDiff = diff;
          }
          hubs.set(node, normalized);
        }
      }

      if (maxDiff < tolerance) {
        break;
      }
    }

    return { hubs, authorities };
  }

  public shortestPath(startNode: string, endNode: string): { path: string[]; distance: number } {
    if (!this.hasNode(startNode) || !this.hasNode(endNode)) {
      return { path: [], distance: Infinity };
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const pq = new PriorityQueue<string>();

    for (const node of this.getNodes()) {
      distances.set(node, Infinity);
      previous.set(node, null);
    }

    distances.set(startNode, 0);
    pq.enqueue(startNode, 0);

    const visited = new Set<string>();

    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      if (!current) break;
      if (current === endNode) break;

      if (visited.has(current)) continue;
      visited.add(current);

      const currentDist = distances.get(current)!;
      const neighbors = this.adjacencyList.get(current)!;

      for (const [neighbor, weight] of neighbors.entries()) {
        const totalDist = currentDist + weight;
        if (totalDist < distances.get(neighbor)!) {
          distances.set(neighbor, totalDist);
          previous.set(neighbor, current);
          pq.enqueue(neighbor, totalDist);
        }
      }
    }

    const path: string[] = [];
    let curr: string | null = endNode;
    while (curr !== null) {
      path.unshift(curr);
      curr = previous.get(curr) || null;
      if (curr === startNode) {
        path.unshift(curr);
        break;
      }
    }

    if (path.length > 0 && path[0] !== startNode) {
      return { path: [], distance: Infinity };
    }

    return {
      path,
      distance: distances.get(endNode) || Infinity,
    };
  }

  public topologicalSort(): string[] | null {
    const inDegree = new Map<string, number>();
    for (const node of this.getNodes()) {
      inDegree.set(node, 0);
    }

    for (const [, edges] of this.adjacencyList.entries()) {
      for (const [target] of edges.entries()) {
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [node, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(node);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);

      const neighbors = this.adjacencyList.get(node)!;
      for (const [target] of neighbors.entries()) {
        const newDeg = inDegree.get(target)! - 1;
        inDegree.set(target, newDeg);
        if (newDeg === 0) {
          queue.push(target);
        }
      }
    }

    if (order.length !== this.nodes.size) {
      return null;
    }

    return order;
  }

  public getConnectedComponents(): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const node of this.getNodes()) {
      if (!visited.has(node)) {
        const component: string[] = [];
        const queue: string[] = [node];
        visited.add(node);

        while (queue.length > 0) {
          const current = queue.shift()!;
          component.push(current);

          const outNeighbors = this.adjacencyList.get(current)!;
          for (const [neighbor] of outNeighbors.entries()) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }

          const inNeighbors = this.reverseAdjacencyList.get(current)!;
          for (const [neighbor] of inNeighbors.entries()) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
        components.push(component);
      }
    }

    return components;
  }
}
