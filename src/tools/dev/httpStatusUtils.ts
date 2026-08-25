export type HttpStatusCategory = "all" | "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

export interface HttpStatusCodeItem {
  code: number;
  message: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  name: string;
  summary: string;
  details: string;
  debugging: string;
  rfc: string;
}

export const HTTP_STATUS_LIST: HttpStatusCodeItem[] = [
  // 1xx 信息响应
  {
    code: 100,
    message: "Continue",
    category: "1xx",
    name: "继续请求",
    summary: "客户端应继续发送请求的其余部分",
    details: "通常用于客户端在发送包含大型请求体（如 POST/PUT 文件上传）前，先发送 Expect: 100-continue 确认服务端是否愿意接收。",
    debugging: "如果服务端直接返回拒绝状态，客户端可以省去上传大体积请求体的网络带宽开销。",
    rfc: "RFC 9110, 15.2.1",
  },
  {
    code: 101,
    message: "Switching Protocols",
    category: "1xx",
    name: "切换协议",
    summary: "服务端已同意按照客户端要求切换通信协议",
    details: "最常见的场景是 HTTP 升级为 WebSocket 连接（Upgrade: websocket 握手响应）。",
    debugging: "检查客户端与服务端的 Upgrade 和 Connection 请求头是否配置齐全。",
    rfc: "RFC 9110, 15.2.2",
  },

  // 2xx 成功响应
  {
    code: 200,
    message: "OK",
    category: "2xx",
    name: "请求成功",
    summary: "请求已成功处理，返回预期的响应体数据",
    details: "标准 HTTP GET/POST 成功响应。GET 返回资源数据，POST 返回创建或处理结果。",
    debugging: "最通用的成功状态码，响应体通常包含 JSON、HTML 或二进制数据流。",
    rfc: "RFC 9110, 15.3.1",
  },
  {
    code: 201,
    message: "Created",
    category: "2xx",
    name: "已创建",
    summary: "请求已成功处理，并且在服务器端创建了新资源",
    details: "常见于 POST/PUT 接口创建新资源后返回，响应头中通常会附带新资源的 URI 路径（Location 头）。",
    debugging: "RESTful API 设计规范推荐在用户注册、发布文章等创建型操作中返回 201。",
    rfc: "RFC 9110, 15.3.2",
  },
  {
    code: 202,
    message: "Accepted",
    category: "2xx",
    name: "已接受处理",
    summary: "服务端已接受请求，但尚未完成处理（异步排队中）",
    details: "通常用于批处理任务、消息队列投递、大数据分析或后台耗时任务派发。",
    debugging: "响应体通常返回一个 task_id，客户端可通过轮询或长连接监听后续任务状态。",
    rfc: "RFC 9110, 15.3.3",
  },
  {
    code: 204,
    message: "No Content",
    category: "2xx",
    name: "无内容",
    summary: "请求已成功处理，但响应报文不包含实体主体",
    details: "常用于 DELETE 删除操作或无需返回数据的 PUT/POST 更新操作，浏览器无需刷新当前页面视图。",
    debugging: "204 响应严禁包含响应体数据，若返回了数据可能会引发客户端解析异常。",
    rfc: "RFC 9110, 15.3.5",
  },
  {
    code: 206,
    message: "Partial Content",
    category: "2xx",
    name: "部分内容",
    summary: "服务端已成功执行范围 Range 请求",
    details: "常见于音视频流播放拖拽进度条、大文件断点续传与多线程分段并发下载。",
    debugging: "需要配合请求头 Range: bytes=0-1024 与响应头 Content-Range 一同校验。",
    rfc: "RFC 9110, 15.3.7",
  },

  // 3xx 重定向
  {
    code: 301,
    message: "Moved Permanently",
    category: "3xx",
    name: "永久重定向",
    summary: "请求的资源已被永久移动至新 URI 路径",
    details: "浏览器和搜索引擎会自动缓存新地址，并将后续对旧 URI 的请求直接重定向至 Location 指定的新地址。",
    debugging: "由于浏览器会强缓存 301 结果，调试时若需修改跳转地址，请清除浏览器缓存或使用隐身窗口测试。",
    rfc: "RFC 9110, 15.4.2",
  },
  {
    code: 302,
    message: "Found",
    category: "3xx",
    name: "临时重定向",
    summary: "请求的资源临时从新 URI 响应，未来仍应访问旧 URI",
    details: "临时跳转，浏览器不会对跳转结果进行长期缓存，常用于未登录鉴权拦截跳转至登录页。",
    debugging: "由于历史原因，部分浏览器可能会将非 GET 请求在 302 跳转后自动降级为 GET 请求。",
    rfc: "RFC 9110, 15.4.3",
  },
  {
    code: 304,
    message: "Not Modified",
    category: "3xx",
    name: "资源未修改",
    summary: "客户端本地缓存仍然有效，可直接读取本地副本",
    details: "条件请求（如带有 If-Modified-Since 或 If-None-Match ETag）匹配成功时返回，节省网络传输流量。",
    debugging: "不包含响应体，由浏览器内部自动读取协商缓存并呈现。",
    rfc: "RFC 9110, 15.4.5",
  },
  {
    code: 307,
    message: "Temporary Redirect",
    category: "3xx",
    name: "严格临时重定向",
    summary: "临时重定向，且严格保证请求方法（POST/PUT等）与请求体不变",
    details: "解决早期 302 在跳转时将 POST 错误转为 GET 的歧义问题。",
    debugging: "若需要在跳转后仍保持原有的 POST 动作与请求体数据，应优先使用 307 代替 302。",
    rfc: "RFC 9110, 15.4.8",
  },
  {
    code: 308,
    message: "Permanent Redirect",
    category: "3xx",
    name: "严格永久重定向",
    summary: "永久重定向，且严格保证请求方法（POST/PUT等）与请求体不变",
    details: "解决早期 301 在跳转时将 POST 错误转为 GET 的歧义问题。",
    debugging: "域名或 API 路由永久迁移时推荐使用 308。",
    rfc: "RFC 9110, 15.4.9",
  },

  // 4xx 客户端错误
  {
    code: 400,
    message: "Bad Request",
    category: "4xx",
    name: "错误请求",
    summary: "请求报文存在语法错误或参数格式不合法",
    details: "通常表示客户端提交了畸形的 JSON、缺少必填参数、字段类型不匹配或超出校验规则。",
    debugging: "检查 Network 面板中的 Request Payload / Query 参数是否符合后端校验约束。",
    rfc: "RFC 9110, 15.5.1",
  },
  {
    code: 401,
    message: "Unauthorized",
    category: "4xx",
    name: "未授权",
    summary: "当前请求缺乏有效的身份认证凭据",
    details: "需要用户先提供合法的身份认证凭证（如 Authorization 请求头、Token 或 Session Cookie）。",
    debugging: "检查 Token 是否已过期、Bearer 格式是否正确或登录状态是否失效。",
    rfc: "RFC 9110, 15.5.2",
  },
  {
    code: 403,
    message: "Forbidden",
    category: "4xx",
    name: "禁止访问",
    summary: "服务端已理解请求身份，但拒绝授予对应资源的访问权限",
    details: "与 401 不同，403 表示即使身份合法，也无权访问该敏感资源（例如普通用户越权访问管理员接口）。",
    debugging: "排查账号的角色与权限策略（RBAC / ACL）是否配置正确。",
    rfc: "RFC 9110, 15.5.4",
  },
  {
    code: 404,
    message: "Not Found",
    category: "4xx",
    name: "未找到资源",
    summary: "服务器无法在当前路由或路径下找到请求的目标资源",
    details: "可能是请求 URL 拼写错误、路径路由未注册、文件不存在或动态资源已被彻底删除。",
    debugging: "核对请求的 API 路径前缀（如 /api/v1）、大小写以及前端 SPA 单页应用的路由回退规则。",
    rfc: "RFC 9110, 15.5.5",
  },
  {
    code: 405,
    message: "Method Not Allowed",
    category: "4xx",
    name: "请求方法不允许",
    summary: "请求的目标资源不支持当前所使用的 HTTP 方法（如 GET/POST/PUT/DELETE）",
    details: "服务端通常会在 Allow 响应头中列出该资源所支持的合法方法列表。",
    debugging: "核对前端调用的 HTTP Method（例如接口仅支持 POST，却错误使用了 GET 调用）。",
    rfc: "RFC 9110, 15.5.6",
  },
  {
    code: 408,
    message: "Request Timeout",
    category: "4xx",
    name: "请求超时",
    summary: "服务端在等待客户端发送完整请求的过程中超时",
    details: "客户端建立连接后未能按时发送完请求头或请求体数据。",
    debugging: "检查客户端弱网环境、大型文件上传分片传输时卡顿或连接异常。",
    rfc: "RFC 9110, 15.5.9",
  },
  {
    code: 409,
    message: "Conflict",
    category: "4xx",
    name: "资源冲突",
    summary: "请求与当前服务器资源的当前状态存在冲突",
    details: "常用于并发乐观锁版本冲突、唯一约束冲突（如重复注册相同的手机号或用户名）。",
    debugging: "需要提示用户重新加载最新版本数据后再次尝试提交。",
    rfc: "RFC 9110, 15.5.10",
  },
  {
    code: 413,
    message: "Payload Too Large",
    category: "4xx",
    name: "请求体过大",
    summary: "客户端提交的请求实体体积超出了服务端允许的最大限制",
    details: "常见于上传超大体积的图片、视频或数据包，触发了 Nginx/网关中的 client_max_body_size 限制。",
    debugging: "调整反向代理与网关的上传体积上限，或在前端引入分片上传机制。",
    rfc: "RFC 9110, 15.5.14",
  },
  {
    code: 415,
    message: "Unsupported Media Type",
    category: "4xx",
    name: "不支持的媒体类型",
    summary: "请求体所声明的 Content-Type 格式不受服务端支持",
    details: "例如后端要求 application/json，前端错误发送了 text/plain 或 multipart/form-data。",
    debugging: "检查 Axios / Fetch 请求头中的 Content-Type 声明。",
    rfc: "RFC 9110, 15.5.16",
  },
  {
    code: 422,
    message: "Unprocessable Content",
    category: "4xx",
    name: "无法处理的实体",
    summary: "请求格式语法正确，但包含语义逻辑错误（如参数业务校验不通过）",
    details: "RESTful API 中广泛用于表单业务校验失败（例如邮箱格式正确但域名不存在、密码强度不足）。",
    debugging: "响应体通常会包含详细的字段级校验失败错误列表。",
    rfc: "RFC 9110, 15.5.21",
  },
  {
    code: 429,
    message: "Too Many Requests",
    category: "4xx",
    name: "请求过于频繁",
    summary: "用户在指定时间内发送了过多请求（触发限流防护）",
    details: "触发服务端的速率限制（Rate Limiting）或防刷机制，通常在 Retry-After 头中提示重试等待时间。",
    debugging: "检查前端是否存在无限死循环轮询请求，或适当增加防抖节流策略。",
    rfc: "RFC 6585, Section 4",
  },

  // 5xx 服务端错误
  {
    code: 500,
    message: "Internal Server Error",
    category: "5xx",
    name: "服务器内部错误",
    summary: "服务器在执行请求时遇到了未捕获的内部异常",
    details: "最常见的通用后端报错，通常代表后端代码抛出了未处理的空指针异常、数据库连接断开或运行时崩溃。",
    debugging: "需要查看后端的应用程序服务日志（Server Logs）和异常堆栈信息定位代码缺陷。",
    rfc: "RFC 9110, 15.6.1",
  },
  {
    code: 502,
    message: "Bad Gateway",
    category: "5xx",
    name: "网关错误",
    summary: "网关或反向代理服务器在尝试执行请求时，从上游服务器收到了无效响应",
    details: "例如 Nginx 作为反向代理转发给 Node/Java/Go 服务时，后端服务未启动或连接突然被重置。",
    debugging: "检查上游应用进程是否存活、端口监听是否正常、网关配置的 proxy_pass 地址是否正确。",
    rfc: "RFC 9110, 15.6.3",
  },
  {
    code: 503,
    message: "Service Unavailable",
    category: "5xx",
    name: "服务暂不可用",
    summary: "由于临时的超载或系统停机维护，服务器当前无法处理请求",
    details: "通常为临时状态，可通过 Retry-After 响应头告知客户端预计恢复服务的时间。",
    debugging: "排查服务是否正处于平滑重启、发布上线、流量突发打满连接池或系统健康检查未通过。",
    rfc: "RFC 9110, 15.6.4",
  },
  {
    code: 504,
    message: "Gateway Timeout",
    category: "5xx",
    name: "网关超时",
    summary: "网关或代理服务器在等待上游服务器响应时超时",
    details: "后端服务正在执行极其耗时的慢 SQL、复杂计算或外部第三方接口卡顿，未能在网关设置的 proxy_read_timeout 时间内完成。",
    debugging: "排查慢查询、死锁、优化后端耗时逻辑或调大网关的代理超时阈值。",
    rfc: "RFC 9110, 15.6.5",
  },
];

/**
 * 模糊检索与过滤状态码列表
 */
export function filterHttpStatusList(
  query: string,
  category: HttpStatusCategory = "all"
): HttpStatusCodeItem[] {
  const clean = query.trim().toLowerCase();

  return HTTP_STATUS_LIST.filter((item) => {
    // 分类筛选
    if (category !== "all" && item.category !== category) {
      return false;
    }

    // 关键词匹配 (匹配代码、英文消息、中文名、摘要或描述)
    if (!clean) return true;

    return (
      item.code.toString().includes(clean) ||
      item.message.toLowerCase().includes(clean) ||
      item.name.toLowerCase().includes(clean) ||
      item.summary.toLowerCase().includes(clean) ||
      item.details.toLowerCase().includes(clean) ||
      item.debugging.toLowerCase().includes(clean)
    );
  });
}
