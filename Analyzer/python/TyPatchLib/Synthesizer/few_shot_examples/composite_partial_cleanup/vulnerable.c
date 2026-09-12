struct composite_cleanup_example_desc;

extern struct composite_cleanup_example_desc *axi_dmac_alloc_desc(void);
extern void kfree(void *pointer);

int composite_cleanup_example_vulnerable(int invalid)
{
	struct composite_cleanup_example_desc *desc = axi_dmac_alloc_desc();

	if (invalid) {
		kfree(desc);
		return -22;
	}
	return 0;
}
