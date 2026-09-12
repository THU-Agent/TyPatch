extern void *memremap(unsigned long address, unsigned long size, int flags);

int nullable_memremap_example_vulnerable(unsigned long address)
{
	struct mailbox {
		int apic_id;
	};
	struct mailbox *mailbox = memremap(address, sizeof(*mailbox), 0);

	return mailbox->apic_id;
}
