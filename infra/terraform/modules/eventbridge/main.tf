# ============================================================================
# EventBridge Module — Event Bus for Domain Events
# ============================================================================

resource "aws_cloudwatch_event_bus" "main" {
  name = "${var.project_name}-events"

  tags = {
    Name = "${var.project_name}-${var.environment}-event-bus"
  }
}

# Archive all events for replay capability
resource "aws_cloudwatch_event_archive" "main" {
  name             = "${var.project_name}-${var.environment}-archive"
  event_source_arn = aws_cloudwatch_event_bus.main.arn
  retention_days   = 30
}

# CloudWatch log group for event monitoring
resource "aws_cloudwatch_log_group" "eventbridge" {
  name              = "/events/${var.project_name}/${var.environment}"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-${var.environment}-eventbridge-logs"
  }
}

# Rule to log all events for debugging
resource "aws_cloudwatch_event_rule" "log_all" {
  name           = "${var.project_name}-${var.environment}-log-all-events"
  event_bus_name = aws_cloudwatch_event_bus.main.name
  description    = "Log all domain events for monitoring"

  event_pattern = jsonencode({
    source = [{ prefix = "webwaka." }]
  })
}

resource "aws_cloudwatch_event_target" "log_all" {
  rule           = aws_cloudwatch_event_rule.log_all.name
  event_bus_name = aws_cloudwatch_event_bus.main.name
  target_id      = "cloudwatch-logs"
  arn            = aws_cloudwatch_log_group.eventbridge.arn
}
