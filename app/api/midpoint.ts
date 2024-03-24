//# API route for handling midpoint calculations for n number of points
import { NextApiRequest, NextApiResponse } from "next";

// Helper function to calculate midpoint
function calculateMidpoint(points: number[][]): number[] {
  const n = points.length;
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    x += points[i][0];
    y += points[i][1];
  }
  return [x / n, y / n];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const points = req.body.points;
    const midpoint = calculateMidpoint(points);
    res.status(200).json({ midpoint });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
