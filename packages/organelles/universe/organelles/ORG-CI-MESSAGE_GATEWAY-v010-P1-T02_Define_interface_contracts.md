# [ORG-CI-MESSAGE_GATEWAY-v0.1.0-P1-T02] Define Interface Contracts

**Issue:** #211 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Primary Interface: IMessageGateway

```typescript
interface IMessageGateway {
  registerChannel(req: RegisterChannelRequest): Promise<Result<ChannelConfig, GatewayError>>;
  sendMessage(req: SendMessageRequest): Promise<Result<Message, GatewayError>>;
  getMessage(req: GetMessageRequest): Promise<Result<Message, GatewayError>>;
  listMessages(req: ListMessagesRequest): Promise<Result<MessagePage, GatewayError>>;
  retryMessage(req: RetryMessageRequest): Promise<Result<Message, GatewayError>>;
  receiveInbound(event: InboundMessageEvent): Promise<Result<InboundMessage, GatewayError>>;
}
```

## Port Interfaces

- **IMessageStorageAdapter**: saveChannel, findChannel, saveMessage, findMessage, findByIdempotencyKey, list
- **IChannelAdapterRegistry**: register(channelType, adapter), resolve(channelType)
- **IChannelAdapter**: send(message): Promise<DeliveryResult>
- **IMessageEventEmitter**: emit(MessageEvent)
- **IMessageObservability**: recordSend, recordDelivery, recordFailure

**Unblocks:** #212

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
