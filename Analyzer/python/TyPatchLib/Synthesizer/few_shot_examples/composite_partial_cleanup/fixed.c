struct composite_cleanup_example_desc;

extern struct composite_cleanup_example_desc *axi_dmac_alloc_desc(void);
extern void axi_dmac_free_desc(struct composite_cleanup_example_desc *desc);

int composite_cleanup_example_fixed(int invalid)
{
	struct composite_cleanup_example_desc *desc = axi_dmac_alloc_desc();

	if (invalid) {
		axi_dmac_free_desc(desc);
		return -22;
	}
	return 0;
}
