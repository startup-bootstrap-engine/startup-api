export enum MessagingBrokerServices {
  MapTransition = "map-transition",
  NpcManager = "npc-manager",
  RpgPathfinding = "rpg_pathfinding",
}

export enum MessagingBrokerActions {
  HandleMapTransition = "handle-map-transition",
  StartBehaviorLoop = "start-behavior-loop",
  LightweightPath = "lightweight_path",
  PathResult = "path_result",
  FindPath = "find_path",
}
