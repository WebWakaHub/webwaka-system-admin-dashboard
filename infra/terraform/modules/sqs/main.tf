# ============================================================================
# SQS Module — Background Job Queues
# ============================================================================

locals {
  queues = {
    "background-jobs" = {
      visibility_timeout = 300
      message_retention  = 1209600  # 14 days
    }
    "notifications" = {
      visibility_timeout = 60
      message_retention  = 86400  # 1 day
    }
    "webhooks" = {
      visibility_timeout = 120
      message_retention  = 345600  # 4 days
    }
  }
}

# ── Main Queues ──────────────────────────────────────────────────────────────

resource "aws_sqs_queue" "main" {
  for_each = local.queues

  name                       = "${var.project_name}-${var.environment}-${each.key}"
  visibility_timeout_seconds = each.value.visibility_timeout
  message_retention_seconds  = each.value.message_retention
  receive_wait_time_seconds  = 20  # Long polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[each.key].arn
    maxReceiveCount     = 3
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}"
  }
}

# ── Dead Letter Queues ───────────────────────────────────────────────────────

resource "aws_sqs_queue" "dlq" {
  for_each = local.queues

  name                      = "${var.project_name}-${var.environment}-${each.key}-dlq"
  message_retention_seconds = 1209600  # 14 days

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}-dlq"
  }
}

# ── CloudWatch Alarms for DLQ ────────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  for_each = local.queues

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-dlq-messages"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Messages in DLQ for ${each.key}"

  dimensions = {
    QueueName = aws_sqs_queue.dlq[each.key].name
  }
}
