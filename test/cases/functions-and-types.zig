const Point = struct {
    x: f32,
    y: f32,
};

fn distance(point: Point) f32 {
    return @sqrt(point.x * point.x + point.y * point.y);
}
