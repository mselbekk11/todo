declare module "react-beautiful-dnd" {
  export const DragDropContext: any
  export const Droppable: any
  export const Draggable: any
  export interface DropResult {
    draggableId: string
    type: string
    source: {
      index: number
      droppableId: string
    }
    destination?: {
      index: number
      droppableId: string
    }
  }
}

