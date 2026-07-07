INSERT INTO tasks (
    title,
    description,
    status,
    priority,
    due_date,
    completed_at,
    created_at,
    updated_at
) VALUES
    (
        'Hoàn thiện báo cáo doanh thu tháng 6',
        'Tổng hợp số liệu doanh thu, lợi nhuận và phần nhận xét để gửi ban điều hành.',
        'PENDING',
        'HIGH',
        '2026-07-08 17:00:00',
        NULL,
        '2026-07-01 08:00:00',
        '2026-07-01 08:00:00'
    ),
    (
        'Rà soát dashboard tiến độ sprint',
        'Kiểm tra biểu đồ dashboard, trạng thái công việc và số lượng task hoàn thành trong sprint hiện tại.',
        'IN_PROGRESS',
        'HIGH',
        '2026-07-09 11:00:00',
        NULL,
        '2026-07-01 08:30:00',
        '2026-07-05 10:20:00'
    ),
    (
        'Cập nhật mô tả API task search',
        'Viết lại mô tả endpoint search để frontend dễ tích hợp tìm kiếm theo tiêu đề hoặc mô tả.',
        'COMPLETED',
        'MEDIUM',
        '2026-07-05 16:00:00',
        '2026-07-05 15:10:00',
        '2026-07-01 09:00:00',
        '2026-07-05 15:10:00'
    ),
    (
        'Chuẩn bị dữ liệu demo cho khách hàng',
        'Tạo dữ liệu demo đủ đa dạng để test search, filter, sort và pagination.',
        'PENDING',
        'HIGH',
        '2026-07-10 15:00:00',
        NULL,
        '2026-07-01 09:30:00',
        '2026-07-01 09:30:00'
    ),
    (
        'Kiểm tra confirm dialog khi xóa task',
        'Xác minh click overlay, nút hủy và escape đều đóng được confirm dialog.',
        'IN_PROGRESS',
        'MEDIUM',
        '2026-07-10 17:30:00',
        NULL,
        '2026-07-01 10:00:00',
        '2026-07-06 09:45:00'
    ),
    (
        'Đóng bug toast lỗi rollback',
        'Kiểm tra rollback optimistic update khi API trả về lỗi 500 hoặc timeout.',
        'COMPLETED',
        'HIGH',
        '2026-07-06 18:00:00',
        '2026-07-06 17:20:00',
        '2026-07-01 10:30:00',
        '2026-07-06 17:20:00'
    ),
    (
        'Theo dõi task overdue của nhóm QA',
        'Lọc các công việc overdue để chuẩn bị báo cáo chất lượng đầu tuần.',
        'PENDING',
        'LOW',
        '2026-07-11 09:00:00',
        NULL,
        '2026-07-01 11:00:00',
        '2026-07-01 11:00:00'
    ),
    (
        'Refactor bộ lọc trạng thái mobile',
        'Tinh chỉnh spacing và active style của bộ lọc trạng thái trên thiết bị mobile.',
        'IN_PROGRESS',
        'LOW',
        '2026-07-12 14:00:00',
        NULL,
        '2026-07-01 11:30:00',
        '2026-07-04 16:00:00'
    ),
    (
        'Hoàn tất tài liệu hướng dẫn smoke test',
        'Tài liệu bao gồm create, edit, delete, search keyword và đổi status task.',
        'COMPLETED',
        'MEDIUM',
        '2026-07-04 12:00:00',
        '2026-07-04 11:10:00',
        '2026-07-01 13:00:00',
        '2026-07-04 11:10:00'
    ),
    (
        'Lập checklist release bản staging',
        'Chuẩn bị checklist release gồm seed data, query URL, sort và phân trang.',
        'PENDING',
        'HIGH',
        '2026-07-13 18:00:00',
        NULL,
        '2026-07-01 14:00:00',
        '2026-07-01 14:00:00'
    ),
    (
        'Review task liên quan báo cáo KPI',
        'Rà soát các đầu việc báo cáo KPI, velocity và thời gian xử lý bug.',
        'IN_PROGRESS',
        'HIGH',
        '2026-07-14 10:30:00',
        NULL,
        '2026-07-01 15:00:00',
        '2026-07-07 09:15:00'
    ),
    (
        'Đóng task migrate seed cũ',
        'Xác nhận migration seed cũ không còn dùng và dữ liệu mới đã đủ cho demo.',
        'COMPLETED',
        'LOW',
        '2026-07-03 17:00:00',
        '2026-07-03 16:25:00',
        '2026-07-01 16:00:00',
        '2026-07-03 16:25:00'
    );

INSERT INTO tasks (
    title,
    description,
    status,
    priority,
    due_date,
    completed_at,
    created_at,
    updated_at
)
SELECT
    CASE
        WHEN series_id % 6 = 0 THEN format('Task seed %s - báo cáo tài chính', series_id)
        WHEN series_id % 6 = 1 THEN format('Task seed %s - dashboard vận hành', series_id)
        WHEN series_id % 6 = 2 THEN format('Task seed %s - mô tả sản phẩm', series_id)
        WHEN series_id % 6 = 3 THEN format('Task seed %s - pagination test', series_id)
        WHEN series_id % 6 = 4 THEN format('Task seed %s - confirm dialog', series_id)
        ELSE format('Task seed %s - search keyword', series_id)
    END AS title,
    CASE
        WHEN series_id % 6 = 0 THEN format('Bổ sung dữ liệu báo cáo để kiểm tra search keyword và sort theo due date cho task số %s.', series_id)
        WHEN series_id % 6 = 1 THEN format('Kiểm tra dashboard với nhiều trạng thái khác nhau, đặc biệt là task số %s đang dùng cho demo.', series_id)
        WHEN series_id % 6 = 2 THEN format('Mô tả chi tiết cho task số %s nhằm test search theo description có dấu tiếng Việt.', series_id)
        WHEN series_id % 6 = 3 THEN format('Dữ liệu dành cho test pagination page size 5, 10, 20 với task số %s.', series_id)
        WHEN series_id % 6 = 4 THEN format('Task số %s dùng để xác minh luồng confirm dialog và toast khi xóa thất bại.', series_id)
        ELSE format('Task số %s được tạo để test search keyword, filter trạng thái và refresh F5 giữ nguyên URL.', series_id)
    END AS description,
    CASE
        WHEN series_id % 3 = 1 THEN 'PENDING'
        WHEN series_id % 3 = 2 THEN 'IN_PROGRESS'
        ELSE 'COMPLETED'
    END AS status,
    CASE
        WHEN series_id % 3 = 1 THEN 'LOW'
        WHEN series_id % 3 = 2 THEN 'MEDIUM'
        ELSE 'HIGH'
    END AS priority,
    TIMESTAMP '2026-07-15 09:00:00' + (series_id || ' days')::INTERVAL AS due_date,
    CASE
        WHEN series_id % 3 = 0 THEN TIMESTAMP '2026-07-02 16:00:00' + (series_id || ' days')::INTERVAL
        ELSE NULL
    END AS completed_at,
    TIMESTAMP '2026-07-02 08:00:00' + (series_id || ' hours')::INTERVAL AS created_at,
    CASE
        WHEN series_id % 3 = 0 THEN TIMESTAMP '2026-07-02 16:00:00' + (series_id || ' days')::INTERVAL
        ELSE TIMESTAMP '2026-07-02 08:00:00' + (series_id || ' hours')::INTERVAL
    END AS updated_at
FROM generate_series(1, 36) AS series_id;
