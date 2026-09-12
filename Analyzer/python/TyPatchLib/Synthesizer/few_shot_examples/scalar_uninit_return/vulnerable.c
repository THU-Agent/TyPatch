extern int example_set_line(unsigned int line);

int scalar_uninit_example_vulnerable(unsigned int count)
{
	unsigned int index;
	int ret;

	for (index = 0; index < count; index++)
		ret = example_set_line(index);
	return ret;
}
