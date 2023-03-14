export class RepoResponseDto {
  data: GithubRepoDto;
}

export class GithubRepoDto {
  repository: Repository;
}

class Repository {
  object: RepoObject;
}

class RepoObject {
  history: History;
}

class History {
  nodes: Node[];
}

class Node {
  tree: Tree;
}

class Tree {
  entries: Entry[];
}

class Entry {
  name: string;
  object: ObjectEntry;
}

class ObjectEntry {
  entries: Entry[];
}
