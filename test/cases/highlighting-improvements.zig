const std = @import("std");

fn open(init: std.process.Init) !void {
    const file: std.Io.File = try init.open() catch unreachable;
    file.close();
}
