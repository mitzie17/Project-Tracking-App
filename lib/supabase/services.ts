import { createClient } from "@/lib/supabase/client";
import { create } from "domain";
import { Board, Column } from "./models";

const supabase = createClient();

export const boardService = {
  async getBoards(userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async createBoard(
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) throw error;

    return data || [];
  },
};

export const columnService = {
  /* async getBoards(userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  }, */

  async createColumn(
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;

    return data || [];
  },
};

export const boardDataService = {
  async createBoardWithDefaultColumns(boardData: {
    title: string;
    description?: string;
    color?: string;
    userId: string;
  }) {
    // here the boardService is called to create a board
    const board = await boardService.createBoard({
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });
    // here the columnService is called to create the four default columns we want
    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Completed", sort_order: 3 },
    ];
    // board.is is obtain from the board object created in line 71
    await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn({ ...column, board_id: board.id })
      )
    );
    return board;
  },
};
