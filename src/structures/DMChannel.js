const Channel = require('./Channel');
const TextBasedChannel = require('./interfaces/TextBasedChannel');
const Collection = require('../util/Collection');

/**
 * Represents a direct message channel between two users.
 * @extends {Channel}
 * @implements {TextBasedChannel}
 */
class DMChannel extends Channel {
  constructor(client, data) {
    super(client, data);
    this.type = 'dm';
    this.messages = new Collection();
    this._typing = new Map();
  }

  setup(data) {
    super.setup(data);

    /**
     * The recipient on the other end of the DM
     * @type {User}
     */
    this.recipient = this.client.dataManager.newUser(data.recipients[0]);

    /**
     * The ID of the last message in the channel, if one was sent
     * @type {?Snowflake}
     */
    this.lastMessageID = data.last_message_id;

    /**
     * The timestamp when the last pinned message was pinned, if there was one
     * @type {?number}
     */
    this.lastPinTimestamp = data.last_pin_timestamp ? new Date(data.last_pin_timestamp).getTime() : null;
  }

  /**
   * When concatenated with a string, this automatically concatenates the recipient's mention instead of the
   * DM channel object.
   * @returns {string}
   */
  toString() {
    return this.recipient.toString();
  }

  /**
  * Fetch all webhooks for the channel.
  * @returns {Promise<Collection<Snowflake, Webhook>>}
  * @example
  * // Fetch webhooks
  * channel.fetchWebhooks()
  *   .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
  *   .catch(console.error);
  */
  fetchWebhooks() {
    return this.client.rest.methods.getChannelWebhooks(this);
  }

  /**
  * Create a webhook for the channel.
  * @param {string} name The name of the webhook
  * @param {BufferResolvable|Base64Resolvable} [avatar] The avatar for the webhook
  * @param {string} [reason] Reason for creating this webhook
  * @returns {Promise<Webhook>} webhook The created webhook
  * @example
  * channel.createWebhook('Snek', 'https://i.imgur.com/mI8XcpG.jpg')
  *   .then(webhook => console.log(`Created webhook ${webhook}`))
  *   .catch(console.error)
  */
  createWebhook(name, avatar, reason) {
    if (typeof avatar === 'string' && avatar.startsWith('data:')) {
      return this.client.rest.methods.createWebhook(this, name, avatar, reason);
    } else {
      return this.client.resolver.resolveImage(avatar).then(data =>
        this.client.rest.methods.createWebhook(this, name, data, reason)
      );
    }
  }


  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  get lastPinAt() { }
  send() { }
  sendMessage() { }
  sendEmbed() { }
  sendFile() { }
  sendFiles() { }
  sendCode() { }
  fetchMessage() { }
  fetchMessages() { }
  fetchPinnedMessages() { }
  search() { }
  startTyping() { }
  stopTyping() { }
  get typing() { }
  get typingCount() { }
  createCollector() { }
  createMessageCollector() { }
  awaitMessages() { }
  // Doesn't work on DM channels; bulkDelete() {}
  acknowledge() { }
  _cacheMessage() { }
}

TextBasedChannel.applyToClass(DMChannel, true, ['bulkDelete']);

module.exports = DMChannel;
