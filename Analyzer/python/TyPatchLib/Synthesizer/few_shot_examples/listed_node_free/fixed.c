struct list_head {
	struct list_head *next;
	struct list_head *prev;
};

struct listed_node_example_channel {
	struct list_head device_node;
	int payload;
};

extern void list_add_tail(struct list_head *node, struct list_head *head);
extern void list_del(struct list_head *node);
extern void kfree(void *pointer);

int listed_node_example_fixed(struct list_head *head, int registration_failed)
{
	struct listed_node_example_channel *channel;

	channel = __builtin_malloc(sizeof(*channel));
	list_add_tail(&channel->device_node, head);
	if (registration_failed) {
		list_del(&channel->device_node);
		kfree(channel);
		return -5;
	}
	return 0;
}
